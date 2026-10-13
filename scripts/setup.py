#!/usr/bin/env python3
"""Fetch immutable dependencies. No global CommandBox/module changes."""
import hashlib,json,os,pathlib,shutil,subprocess,urllib.request,zipfile
ROOT=pathlib.Path(__file__).resolve().parent.parent
os.chdir(ROOT)
pins=json.loads((ROOT/'dependencies.json').read_text())
def run(*args,env=None): subprocess.run(args,check=True,env=env)
def download(url,target,digest=None):
 target=pathlib.Path(target); target.parent.mkdir(parents=True,exist_ok=True)
 if not target.exists():
  print('Downloading',url,flush=True)
  with urllib.request.urlopen(url) as source, target.open('wb') as dest: shutil.copyfileobj(source,dest)
 if digest and hashlib.sha256(target.read_bytes()).hexdigest()!=digest: raise SystemExit('Checksum mismatch: '+str(target))
def link(target,dest):
 dest=pathlib.Path(dest)
 if dest.is_symlink(): dest.unlink()
 if dest.exists(): raise SystemExit('Refusing to overwrite '+str(dest))
 dest.symlink_to(pathlib.Path(target).resolve(),target_is_directory=True)
for key,name in [('testbox','testbox'),('cli','testbox-cli')]:
 dep=ROOT/'.deps'/name; pin=pins[key]
 if not dep.exists(): run('git','clone',pin['repository'],str(dep))
 actual=subprocess.check_output(['git','-C',str(dep),'rev-parse','HEAD'],text=True).strip()
 if actual!=pin['commit']:
  if subprocess.check_output(['git','-C',str(dep),'status','--porcelain'],text=True).strip(): raise SystemExit('Dirty dependency: '+str(dep))
  run('git','-C',str(dep),'fetch','origin',pin['commit']);run('git','-C',str(dep),'checkout','--detach',pin['commit'])
link(ROOT/'.deps/testbox',ROOT/'testbox')
link(ROOT/'.deps/testbox',ROOT/'.deps/testbox-cli/testbox')
for key,target in [('boxlang','.deps/boxlang-1.18.0.jar'),('compat','.deps/bx-compat-cfml.zip')]: download(pins[key]['url'],target,pins[key]['sha256'])
modules=ROOT/'.runtime/boxlang/modules';modules.mkdir(parents=True,exist_ok=True)
compat=modules/'bx-compat-cfml'
if not compat.exists():
 with zipfile.ZipFile('.deps/bx-compat-cfml.zip') as z: z.extractall(compat)
# Dedicated CommandBox executable + home, never ~/.CommandBox.
version=pins['commandbox']; download(f'https://downloads.ortussolutions.com/ortussolutions/commandbox/{version}/commandbox-bin-{version}.zip','.deps/commandbox.zip',pins['commandboxSha256'])
binary=ROOT/'.runtime/bin/box'
if not binary.exists():
 with zipfile.ZipFile('.deps/commandbox.zip') as z: z.extractall(binary.parent)
 binary.chmod(0o755)
home=ROOT/'.runtime/commandbox';home.mkdir(parents=True,exist_ok=True)
env=dict(os.environ,COMMANDBOX_HOME=str(home))
module=home/'cfml/modules/testbox-cli'
if module.is_symlink(): module.unlink()
run(str(binary),'version',env=env)
module=home/'cfml/modules/testbox-cli'
if module.exists() and not module.is_symlink(): shutil.move(str(module),str(home/'stock-testbox-cli'))
link(ROOT/'.deps/testbox-cli',module)
moduleArchive=ROOT/'.deps/commandbox-boxlang.zip'
download(pins['commandboxModule']['url'],moduleArchive,pins['commandboxModule']['sha256'])
if not (home/'cfml/modules/commandbox-boxlang').exists():
 with zipfile.ZipFile(moduleArchive) as z: z.extractall(home/'cfml/modules/commandbox-boxlang')
for name,pin in pins['modules'].items():
 archive=ROOT/'.deps'/f'{name}.zip';download(pin['url'],archive,pin['sha256'])
 target=ROOT/'.deps/testbox/system/modules'/name
 if name=='cbproxies': target=ROOT/'.deps/testbox/system/modules/cbstreams/modules/cbproxies'
 if target.exists(): shutil.rmtree(target)
 target.mkdir(parents=True)
 with zipfile.ZipFile(archive) as z:
  if name=='globber':
   prefix=z.namelist()[0]
   for info in z.infolist():
    relative=info.filename[len(prefix):]
    if not relative: continue
    dest=target/relative
    if info.is_dir(): dest.mkdir(parents=True,exist_ok=True)
    else: dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(info))
  else: z.extractall(target)
# Pre-provision the checksum-verified servlet, including the pinned CFML module.
archive=ROOT/'.deps/boxlang-servlet.zip';download(pins['servlet']['url'],archive,pins['servlet']['sha256'])
engine=ROOT/'.engine/boxlang'
if not (engine/'WEB-INF').exists():
 with zipfile.ZipFile(archive) as z:
  war=next(n for n in z.namelist() if n.endswith('.war'))
  warpath=ROOT/'.deps/boxlang.war';warpath.write_bytes(z.read(war))
 with zipfile.ZipFile(warpath) as z: z.extractall(engine)
engineModules=engine/'WEB-INF/boxlang/modules';engineModules.mkdir(parents=True,exist_ok=True)
if not (engineModules/'bx-compat-cfml').exists(): shutil.copytree(compat,engineModules/'bx-compat-cfml')

for name in ['testbox','testbox-cli']:
 run('git','-C',str(ROOT/'.deps'/name),'diff','--exit-code')
print('Ready. Run scripts/start',flush=True)
