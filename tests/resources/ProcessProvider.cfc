/** A real child JVM per worker. No HTTP requests or simulated reports. */
component extends="testbox.system.parallel.WorkerProvider" {
    function prepareRun( required struct context ) {
        variables.root = expandPath( "/" )
        variables.handles = []
        variables.ownedDirectories = []
        context.onProgress( "Preparing private JVM homes and parcel workspaces" )
    }
    struct function startWorker( required struct context ) {
        if ( isCancelled( context.run ) ) throw( message="Run cancelled during setup." )
        var dir = context.run.output & "/worker-" & context.workerId
        variables.ownedDirectories.append( dir )
        directoryCreate( dir, true )
        directoryCreate( dir & "/workspace", true )
        fileWrite( dir & "/selection.json", serializeJSON( {bundles:context.bundles, filters:context.run.filters} ) )
        var home = dir & "/home"
        directoryCreate( home, true )
        directoryCopy( variables.root & ".runtime/boxlang/modules", home & "/modules", true )
        var javaBin = getSystemSetting( "PARCEL_JAVA", createObject( "java", "java.lang.System" ).getProperty( "java.home" ) & "/bin/java" )
        var args = createObject( "java", "java.util.ArrayList" ).init()
        for ( var arg in [ javaBin, "-Xmx256m", "-Djava.io.tmpdir=" & dir & "/workspace", "-cp", variables.root & ".deps/boxlang-1.18.0.jar", "ortus.boxlang.runtime.BoxRunner", variables.root & "tests/worker.bxs" ] ) args.add( javacast( "string", arg ) )
        var builder = createObject( "java", "java.lang.ProcessBuilder" ).init( args )
        builder.directory( createObject( "java", "java.io.File" ).init( variables.root ) )
        builder.redirectErrorStream( true )
        builder.redirectOutput( createObject( "java", "java.io.File" ).init( dir & "/process.log" ) )
        var env = builder.environment()
        env.put( "BOXLANG_HOME", home )
        env.put( "PARCEL_SELECTION", dir & "/selection.json" )
        env.put( "PARCEL_PROGRESS", dir & "/progress.jsonl" )
        env.put( "PARCEL_RESULT", dir & "/result.json" )
        env.put( "PARCEL_DELAY_MS", getSystemSetting( "PARCEL_DELAY_MS", "300" ) )
        env.put( "TMPDIR", dir )
        var handle = {dir:dir, cursor:0, started:getTickCount(), process:builder.start()}
        variables.handles.append( handle )
        return handle
    }
    struct function pollWorker( required struct worker ) {
        var events = []
        if ( fileExists( worker.dir & "/progress.jsonl" ) ) {
            var lines = listToArray( fileRead( worker.dir & "/progress.jsonl" ), chr(10) )
            while ( worker.cursor < lines.len() && isJSON( lines[ worker.cursor + 1 ] ) ) {
                worker.cursor++
                events.append( deserializeJSON( lines[ worker.cursor ] ) )
            }
        }
        if ( worker.process.isAlive() ) return {events:events, done:false}
        if ( worker.process.exitValue() != 0 || !fileExists( worker.dir & "/result.json" ) ) {
            throw( type="Parcel.WorkerFailed", message="Child JVM failed; inspect " & worker.dir & "/process.log" )
        }
        return {events:events, done:true, result:{complete:true, report:deserializeJSON( fileRead( worker.dir & "/result.json" ) ), seconds:(getTickCount()-worker.started)/1000}}
    }
    function stopWorker( required struct worker ) {
        if ( worker.process.isAlive() ) worker.process.destroy()
        if ( worker.process.isAlive() ) worker.process.destroyForcibly()
        worker.process.waitFor( javacast( "long", 5 ), createObject( "java", "java.util.concurrent.TimeUnit" ).SECONDS )
        if ( worker.process.isAlive() ) throw( message="Owned child JVM did not stop." )
        if ( directoryExists( worker.dir & "/home" ) ) directoryDelete( worker.dir & "/home", true )
        if ( directoryExists( worker.dir & "/workspace" ) ) directoryDelete( worker.dir & "/workspace", true )
        fileWrite( worker.dir & "/cleanup.json", serializeJSON( {pid:worker.process.pid(), stopped:true, homeRemoved:true, workspaceRemoved:true} ) )
    }
    function finishRun( required struct context ) {
        for ( var dir in variables.ownedDirectories ?: [] ) {
            for ( var child in [ "home", "workspace" ] ) if ( directoryExists( dir & "/" & child ) ) directoryDelete( dir & "/" & child, true )
        }
    }
    function stopWorkers( required array handles, required struct context ) {
        for ( var handle in handles ) if ( handle.process.isAlive() ) handle.process.destroy()
        var deadline = getTickCount() + 30000
        while ( getTickCount() < deadline ) {
            var alive = false
            for ( var handle in handles ) if ( handle.process.isAlive() ) alive = true
            if ( !alive ) break;
            sleep( 50 )
        }
        for ( var handle in handles ) {
            if ( handle.process.isAlive() ) { context.onShutdownProgress( "Force-stopping owned worker JVM" ); handle.process.destroyForcibly() }
            stopWorker( handle )
        }
    }
}
