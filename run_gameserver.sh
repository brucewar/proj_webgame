rm /data/forever.log -f
rm /data/out.log -f
rm /data/err.log -f
cd /data/webgame_product/proj_webgame/WeiXin_Server
nohup node weixin_server.js &
cd /data/webgame_product/proj_webgame/Portal_Server
nohup forever portal_server.js &
