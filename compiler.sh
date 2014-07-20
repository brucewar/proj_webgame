#!/bin/bash
PWD="/home/bruce/NodeJS/webgame_product/"
compileFolder1="proj_webgame/Portal_Server/gallery/js/"
compileFolder2="proj_webgame/Portal_Server/games/bandits/js/"
compileFolder3="proj_webgame/Portal_Server/games/bricks/js/"
compileFolder4="proj_webgame/Portal_Server/games/bubbles/js/"
compileFolder5="proj_webgame/Portal_Server/games/connect/js/"
compileFolder6="proj_webgame/Portal_Server/games/bandits/js/src/"
compileFolder7="proj_webgame/Portal_Server/games/bricks/js/src/"
compileFolder8="proj_webgame/Portal_Server/games/bubbles/js/src/"
compileFolder9="proj_webgame/Portal_Server/games/connect/js/src/"
compileFolder10="proj_webgame/Portal_Server/games/js/"
compileFolder11="proj_webgame/Portal_Server/public_js/image_process/"
compileFolder12="proj_webgame/Portal_Server/public_js/"
notCompileFile="proj_webgame/Portal_Server/public_js/cocos2d-html5.min.js"
function scanDir()
{
	for file in `ls $1`
	do
		if [ -d $1"/"$file ]
		then
			scanDir $1"/"$file
		else
			if [ $1"/" = $compileFolder1 ] || \
			[ $1"/" = $compileFolder2 ] || \
			[ $1"/" = $compileFolder3 ] || \
			[ $1"/" = $compileFolder4 ] || \
			[ $1"/" = $compileFolder5 ] || \
			[ $1"/" = $compileFolder6 ] || \
			[ $1"/" = $compileFolder7 ] || \
			[ $1"/" = $compileFolder8 ] || \
			[ $1"/" = $compileFolder9 ] || \
			[ $1"/" = $compileFolder10 ] || \
			[ $1"/" = $compileFolder11 ] || \
			[ $1"/" = $compileFolder12 ] && \
			[ $1"/"$file != $notCompileFile ]
			then
				mkdir -p $PWD$1
				java -jar compiler.jar --js $1"/"$file --js_output_file $PWD$1"/"$file
			else
				mkdir -p $PWD$1
				cp -v $1"/"$file $PWD$1"/"$file
			fi
		fi
	done
}
INIT_PATH="proj_webgame"
rm -rf $PWD
scanDir $INIT_PATH
