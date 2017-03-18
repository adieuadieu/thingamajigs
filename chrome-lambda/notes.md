## Misc unorganized dump of notes




Lambda function deployment package size (.zip/.jar file)	50 MB
Total size of all the deployment packages that can be uploaded per region	75 GB
Size of code/dependencies that you can zip into a deployment package (uncompressed zip/jar size)	250 MB


https://v98314er9f.execute-api.us-west-2.amazonaws.com/dev/generate/pdf?url=https://github.com/adieuadieu

https://groups.google.com/a/chromium.org/forum/#!forum/headless-dev

64 mb size limit issue?
https://bugs.chromium.org/p/chromium/issues/detail?id=522853

/dev/shm doesn't exist in lambda: https://forums.aws.amazon.com/thread.jspa?threadID=219962


some good stuff here https://claudiajs.com/tutorials/pandoc-lambda.html

headless chrome code: https://cs.chromium.org/chromium/src/headless/app/

https://chromedevtools.github.io/debugger-protocol-viewer/tot/Log/

https://productforums.google.com/forum/#!topic/chrome/bBSUEDtLBfA

https://bugs.chromium.org/p/chromium/issues/detail?id=546953#c54
https://chromium.googlesource.com/chromium/src/+/master/headless/README.md

http://www.zackarychapple.guru/chrome/2016/08/24/chrome-headless.html
https://chromium.googlesource.com/chromium/src/+/master/docs/linux_build_instructions.md
http://mirror.centos.org/centos/6/os/x86_64/
https://mockingbot.com/posts/173

https://chromium.googlesource.com/chromium/src/+/master/docs/mac_build_instructions.md

// centos: (fail)
sudo printf "LANG=en_US.utf-8\nLC_ALL=en_US.utf-8" >> /etc/environment
sudo yum install -y git redhat-lsb python bzip2 tar pkgconfig atk-devel alsa-lib-devel bison binutils brlapi-devel bluez-libs-devel bzip2-devel cairo-devel cups-devel dbus-devel dbus-glib-devel expat-devel fontconfig-devel freetype-devel gcc-c++ GConf2-devel glib2-devel glibc.i686 gperf glib2-devel gtk2-devel gtk3-devel java-1.*.0-openjdk-devel libatomic libcap-devel libffi-devel libgcc.i686 libgnome-keyring-devel libjpeg-devel libstdc++.i686 libX11-devel libXScrnSaver-devel libXtst-devel libxkbcommon-x11-devel ncurses-compat-libs nspr-devel nss-devel pam-devel pango-devel pciutils-devel pulseaudio-libs-devel zlib.i686 httpd mod_ssl php php-cli python-psutil wdiff --enablerepo=epel
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
echo "export PATH=$PATH:$HOME/depot_tools" >> ~/.bash_profile
source ~/.bash_profile
mkdir Chromium && cd Chromium
fetch --no-history chromium
cd src
mkdir -p out/Headless
echo 'import("//build/args/headless.gn")' > out/Headless/args.gn
echo 'is_debug = false' >> out/Headless/args.gn
echo 'symbol_level = 0' >> out/Headless/args.gn
echo 'is_component_build = false' >> out/Headless/args.gn
echo 'remove_webcore_debug_symbols = true' >> out/Headless/args.gn
echo 'enable_nacl = false' >> out/Headless/args.gn
gn gen out/Headless
ninja -C out/Headless headless_shell



// make the tarball
mkdir out/headless-chrome && cd out
cp Headless/headless_shell Headless/libosmesa.so headless-chrome/
tar -zcvf headless-chrome-linux-x64.tar.gz headless-chrome/

be sure to export AWS_PROFILE=serverless-admin


// ubuntu:
sudo locale-gen en
sudo printf "LANG=en_US.utf-8\nLC_ALL=en_US.utf-8" >> /etc/environment

sudo apt-get install -y git python2.7 python
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
echo "export PATH=$PATH:/home/ubuntu/depot_tools" >> ~/.bash_profile
source ~/.bash_profile
mkdir Chromium && cd Chromium
fetch --no-history chromium
cd src
./build/install-build-deps.sh --no-prompt
------ You will be prompted to accept a EULA for fonts. Accept the agreement. -----
mkdir -p out/Headless
echo 'import("//build/args/headless.gn")' > out/Headless/args.gn
echo 'is_debug = false' >> out/Headless/args.gn
echo 'symbol_level = 0' >> out/Headless/args.gn
echo 'is_component_build = false' >> out/Headless/args.gn
gn gen out/Headless
ninja -C out/Headless headless_shell





where dev/shm is coming from: https://cs.chromium.org/chromium/src/base/files/file_util_posix.cc?dr&l=936

/home/ec2-user/Chromium/src/base/files/file_util_posix.cc



https://cs.chromium.org/chromium/src/components/discardable_memory/service/discardable_shared_memory_manager.cc?type=cs&q=shmem_dir&l=179
https://cs.chromium.org/chromium/src/base/files/file_util_posix.cc?dr&l=936
