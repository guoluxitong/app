<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
    export default {
        name: 'boiler-manage-electron-vue',
        mounted(){
            this.messageOpen()
        },
        methods:{
            messageOpen(){
                this.$alert('</br><strong>有新版本需要下载，下载安装后请运行新版本程序！</strong></br><strong>此程序将不再提供更新维护，请尽快卸载！</strong></br>', '更新提醒', {
                    confirmButtonText: '下载新版本',
                    dangerouslyUseHTMLString: true,
                    type:"warning",
                    showClose:false,
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.message = '正在下载';
                            instance.confirmButtonText = '下载中...';
                            let urls = "http://autoupdate.sdcsoft.com.cn/files/BoilerPlantSystem/update/appDownload.exe";
                            window.location.href = urls;
                            setTimeout(() => {
                                instance.message = '下载完成，请关闭程序进行安装';
                                instance.confirmButtonLoading = false;
                                instance.showConfirmButton = false;
                                setTimeout(()=>{
                                    done();
                                },5000)
                            },10000)

                        }else {
                            done();
                        }
                    }
                });
            }
        }
    }
</script>
