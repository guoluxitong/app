<template>
    <div class="product-runInfo" v-title data-title="运行信息" style="overflow-y:auto">
        <animation :stove-animation="controllerFormData.stoveAnimation" :fan-animation-list="controllerFormData.fanAnimationList" :beng-animation-list="controllerFormData.bengAnimationList"></animation>
        <el-row class="run-tab">
            <el-tabs  type="card" v-model="controllerFormData.activeName" :style="{'float':'left','width':'100%','overflow-y':'auto','height':runTabHeight+'px'}">
                <el-tab-pane label="异常信息" name="first" v-if="controllerFormData.exceptionInfoMap&&Object.keys(controllerFormData.exceptionInfoMap).length>0">
                    <el-row v-for="item in controllerFormData.exceptionInfoMap" :key="item.name"><span class="dataTitle">{{item.title}}</span> </el-row>
                </el-tab-pane>
                <el-tab-pane label="基本信息" name="second">
                    <el-row v-for="item in controllerFormData.baseInfoMap" :key="item.name"><span class="dataTitle">{{item.title}}：</span>{{item.valueString}} </el-row>
                </el-tab-pane>
                <el-tab-pane label="当前模拟量" name="third">
                    <el-row v-for="item in controllerFormData.mockInfoMap" :key="item.name"><span class="dataTitle">{{item.title}}：</span>{{item.valueString}} </el-row>
                </el-tab-pane>
                <el-tab-pane label="设定参数" name="fourth">
                    <el-row v-for="item in controllerFormData.settingInfoMap" :key="item.name"><span class="dataTitle">{{item.title}}：</span>{{item.valueString}} </el-row>
                </el-tab-pane>
                <el-tab-pane label="设备信息" name="five">
                    <el-row v-for="item in controllerFormData.deviceInfoMap" :key="item.name"><span class="dataTitle">{{item.title}}：</span>{{item.valueString}} </el-row>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </div>
</template>
<script>
    import {getControllerByteData,getControllerType} from '@/api/controller'
    import {getDeviceByByteDataAndType} from "@/dataparse/model/deviceAdapter";
    import {deviceModel} from '@/dataparse/model/sdcSoftDevice'
    import animation from './components/animation'
    const {remote} = require('electron')
    const {Menu, MenuItem} = remote
    export default {
            name:'controller-run-info',
        components:{
          animation
        },
        data(){
            return{
                dialogDeviceFormVisible: false,
                runTabHeight:document.body.clientHeight-125,
                timeInterVal:3,
                controllerFormData:{
                    activeName:'second',
                    stoveAnimation:'',
                    fanAnimationList:[],
                    bengAnimationList:[],
                    exceptionInfoMap:{},
                    baseInfoMap:{},
                    mockInfoMap:{},
                    settingInfoMap:{},
                    deviceInfoMap:{},
                },
            }
        },
        created(){
            let self=this
            window.onresize = function(){
                self.runTabHeight=document.body.clientHeight-160
            }
            this.configContextMenu()
            this.setTimeInterval()
            this.showControllerData()
        },
        methods:{
            configContextMenu(){
                const menu = new Menu()
                let self=this
                menu.append(new MenuItem({label: '参数设置',
                    click() {
                        self.$prompt('请输入间隔时间（秒）', '通讯参数', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            inputValue:self.timeInterVal,
                        }).then(({ value }) => {
                            window.localStorage['timeInterVal']=value
                            self.$message({
                                type: 'success',
                                message: '设置成功'
                            });
                        }).catch(() => {
                            self.$message({
                                type: 'info',
                                message: '取消输入'
                            });
                        });
                    }}
                ))
                menu.append(new MenuItem({type: 'separator'}))
                menu.append(new MenuItem({label: '动画设置', click() { console.log('item 1 clicked') }}))
                window.addEventListener('contextmenu', (e) => {
                    e.preventDefault()
                    menu.popup({window: remote.getCurrentWindow()})
                }, false)
            },
            setTimeInterval(){
                let timeInterVal=window.localStorage['timeInterVal']
                if(timeInterVal) this.timeInterVal=timeInterVal
                setInterval( ()=> {
                    this.showControllerData()
                },1000*(this.timeInterVal));
            },
            showControllerData(){
                Promise.all([getControllerByteData(this.$route.query.controllerNo),getControllerType(this.$route.query.controllerNo)]).then((data)=>{
                    let controllerByteData=data[0].data
                    let controllerType=data[1].data.deviceType
                    if(controllerByteData.length>0&&controllerType){
                        this.getDeviceByByteDataAndType(controllerByteData,controllerType)
                    }
                }).catch(function(r){
                    console.log(r);
                })
            },
            getDeviceByByteDataAndType(byteData,deviceType){
                getDeviceByByteDataAndType(byteData,deviceType).then(data=>{
                    this.controllerFormData.bengAnimationList=data.getBeng()
                    this.controllerFormData.fanAnimationList=data.getFan()
                    this.controllerFormData.stoveAnimation=data.getStoveElement().GetElementPrefixAndValuesString()
                    this.controllerFormData.exceptionInfoMap=data.getExceptionFields()
                    this.controllerFormData.baseInfoMap=data.getBaseInfoFields()
                    this.controllerFormData.mockInfoMap=data.getMockFields()
                    this.controllerFormData.settingInfoMap=data.getSettingFields()
                    this.controllerFormData.deviceInfoMap=data.getDeviceInfoFields()
                })
            },
            initControllerInfo(){
                this.controllerFormData.exceptionInfoMap={}
                this.controllerFormData.baseInfoMap={}
                this.controllerFormData.mockInfoMap={}
                this.controllerFormData.settingInfoMap={}
                this.controllerFormData.deviceInfoMap={}
            },
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss">
    .product-runInfo {
        padding-left: 5px;
        padding-right: 5px;
        .deviceImg{
            float: left;
        }
        .deviceShuiBeng{
            margin-top: 71.3px;
            margin-left: 5%;
        }
        .run-tab{
            font-size: 14px;
            font-weight: 500;
            color: #303133;
        }
    }
</style>