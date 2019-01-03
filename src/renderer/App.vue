<template>
  <div id="app">
    <router-view></router-view>
      <el-dialog
              title="更新提示："
              :visible.sync="dialogVisible"
              width="90%"
              :show-close="false"
              :close-on-click-modal="false"
              :close-on-press-escape="false"
      >
          <span>{{updateInfo}}</span>
          <el-progress v-show="progressVisible" :text-inside="true" :stroke-width="18" :percentage="progressValue"></el-progress>
          <span slot="footer" class="dialog-footer" >
              <el-button @click="handleClose" v-show="flag">取 消</el-button>
              <el-button type="primary" @click="updateClick" v-show="flag">确 定</el-button>
              <el-button type="primary" @click="dialogVisible = false" v-show="btnVisible">确 定</el-button>
          </span>
      </el-dialog>
  </div>
</template>

<script>
    const {ipcRenderer} = require('electron');
    export default {
        name: 'boiler-manage-electron-vue',
        data() {
            return {
                dialogVisible: false,
                updateInfo:'暂无更新',
                flag:false,
                progressValue: 0,
                progressVisible: false,
                btnVisible:true,
            };
        },
        mounted(){
            this.dialogVisible = true;
            ipcRenderer.on('message',(event,{message,data}) => {
                switch (message) {
                    case 'error':
                        this.updateInfo = '更新失败，请联系开发人员解决';
                        break;
                    case 'downloadProgress':
                        this.updateInfo = '正在下载更新...';
                        this.progressVisible = true;
                        this.btnVisible = false;
                        this.progressValue = parseInt(data.percent);
                        break;
                    case 'isUpdateNow':
                        this.progressVisible = false;
                        this.btnVisible = false;
                        this.updateInfo = '下载完成,是否现在更新？';
                        this.flag = true;
                        break;
                    default:
                        break;
                }
            });
        },
        methods:{
            handleClose(done) {
                this.$confirm('软件会在关闭后启动更新！')
                    .then(_ => {
                        done();
                    })
                    .catch(_ => {});
                this.dialogVisible = false;
            },
            updateClick(){

                ipcRenderer.send('updateNow');
                this.dialogVisible = false;
            }
        },
        beforeDestroy(){
            ipcRenderer.removeAll(["message", "downloadProgress", "isUpdateNow",'update-not-available','update-available','checking-for-update','error']);
        }
    }


</script>
