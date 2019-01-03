import { app, BrowserWindow,ipcMain} from 'electron'
import {autoUpdater} from 'electron-updater'
const feedUrl = "http://autoupdate.sdcsoft.com.cn/files/BoilerPlantSystemTest/";
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
let webContents
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9081`
    : `file://${__dirname}/index.html`

let createWindow = () => {
    let win = new BrowserWindow({
        title:"锅炉远程监控平台",
        icon: __static+'/common/icon.ico',
        width: 480,
        height: 470,
        frame:false,
        maximizable:false,
        webPreferences: {webSecurity: false},
    })
    webContents = win.webContents
    win.loadURL(winURL)

    win.on('closed', () => {
        win = null
    })
    //启用开发者工具
    //webContents.openDevTools();
};
let sendUpdateMessage = (message,data) =>{
    //console.log({message,data});
    webContents.send('message',{message,data});
};
let checkForUpdates = ()=>{
    autoUpdater.setFeedURL(feedUrl);
    autoUpdater.on('error',function (message) {
        sendUpdateMessage('error',message)
    });
    autoUpdater.on('checking-for-update', function (message) {
        sendUpdateMessage('checking-for-update', message)
    });
    autoUpdater.on('update-available', function (message) {
        sendUpdateMessage('update-available', message)
    });
    autoUpdater.on('update-not-available', function (message) {
        sendUpdateMessage('update-not-available', message)
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        sendUpdateMessage('downloadProgress', progressObj)
    })
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
        ipcMain.on('updateNow', (e, arg) => {
            //some code here to handle event
            autoUpdater.quitAndInstall();
        })
        sendUpdateMessage('isUpdateNow');
    });

    //执行自动更新检查
    autoUpdater.checkForUpdates();
};
app.on('ready', ()=>{
    createWindow();
    setTimeout(checkForUpdates,1000);
});
app.on('window-all-closed', () => app.quit());
/*****************************************************升级程序********************************************************/
