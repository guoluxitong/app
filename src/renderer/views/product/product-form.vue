<template>
    <div class="product-form" style="overflow-y:auto">
        <el-form  :rules="rules" ref="productForm" :model="productFormData" label-position="right" label-width="100px" style='width: 96%; margin-left:15px;margin-top:15px'>              
            <el-row>
                <el-col :span="12">
                    <el-form-item label="锅炉编号" prop="boilerNo">
                        <el-input v-model="productFormData.boilerNo"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="锅炉型号">
                        <el-select clearable class="filter-item" v-model="productFormData.boilerModelNumber"  style="width: 60%">
                            <el-option v-for="item in boilerModelNumberArray" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                        <el-button type="primary" @click="handleAddBoilerModel" v-permission="['3']">添加</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="控制器编号" prop="controllerNo">
                        <el-input v-model="productFormData.controllerNo"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12" >
                    <el-form-item label="吨位（T）" prop="tonnageNum">
                        <el-input v-model="productFormData.tonnageNum"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="燃料" prop="fuel">
                        <el-select clearable class="filter-item" v-model="productFormData.fuel" style="width: 100%" >
                            <el-option v-for="item in fuelArray" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="介质" prop="medium">
                        <el-select clearable class="filter-item" v-model="productFormData.medium" style="width: 100%" >
                            <el-option v-for="item in mediumArray" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>            
            <div class="product-footer">
                <el-button type="primary" @click="submitForm">确认</el-button>
            </div>
        </el-form>
    </div>
</template>
<script>
    import {formatDateTime} from '@/utils/date'
    import {validatePositiveAndSmallAndFloatNum} from '@/utils/validate'
    import {openElectronWindow} from '@/utils/windowsOperate'
    import permission from '@/directive/permission/index.js'
    import {initMedium,initFuel,initIsSell} from './product-dictionary'
    import {getBoilerModelListByCondition} from '@/api/boilerModel'
    import {getAuxiliaryMachineLargeClassListByCondition} from '@/api/auxiliaryMachineLargeClass'
    import {getAuxiliaryMachineSmallClassListByCondition} from '@/api/auxiliaryMachineSmallClass'
    import {editProduct} from '@/api/product'
    const {ipcRenderer} = require('electron')
    const {ipcMain} = require('electron').remote
    function dictionaryValueFilter(dictionaryValue,value) {
        const dictionaryValueItem = dictionaryValue.filter(item => {
            return item.value==value
        })
        return dictionaryValueItem[0]
    }
    export default {
        directives: { permission },
        data() {
            const validatePositiveAndSmallAndFloatNumFun = (rule, value, callback) => {
                if (!validatePositiveAndSmallAndFloatNum(value)) {
                    callback(new Error('请输入数字'))
                } else {
                    callback()
                }
            }
            const validateFuelFun = (rule, value, callback) => {
                if(value==null){
                    callback(new Error('请选择燃料'))
                }else {
                    callback()
                }
            }
            const validateMediumFun = (rule, value, callback) => {
                if(value==null){
                    callback(new Error('请选择介质'))
                }else {
                    callback()
                }
            }
            return {
                boilerModelNumberArray:[],
                mediumArray:[],
                fuelArray:[],
                isSellArray:[],
                activeName:'first',
                productFormData:{
                    id:'',
                    roleIdArray:this.$store.state.user.roleIdArray,
                    userId:this.$store.state.user.userId,
                    orgId:this.$store.state.user.orgId,
                    orgType:this.$store.state.user.orgType,
                    controllerNo:'',
                    boilerNo:'',
                    boilerModelNumber:null,
                    tonnageNum:null,
                    medium:null,
                    fuel:null,
                    createDateTime:formatDateTime(new Date(),"yyyy-MM-dd hh:mm:ss"),
                    editDateTime:formatDateTime(new Date(),"yyyy-MM-dd hh:mm:ss"),
                    isSell:0,
                    productAuxiliaryMachineInfoList:[]
                },
                rules:{
                    tonnageNum: [{trigger: 'blur', validator: validatePositiveAndSmallAndFloatNumFun}],
                    boilerNo: [{ required: true,trigger: 'blur', message: '锅炉编号不能为空' }],
                    controllerNo: [{ required: true,trigger: 'blur', message: '设备编号不能为空' }],
                    fuel: [{ required: true,trigger: 'blur', validator: validateFuelFun }],
                    medium: [{ required: true,trigger: 'blur', validator: validateMediumFun }],
                },
                largeClassOptions:[],
                smallClassOptions:[],
            }
        },
        filters: {
            dictionaryValueFieldFilter(value,dictionaryValueArray) {
                if(dictionaryValueFilter(dictionaryValueArray,value))
                    return dictionaryValueFilter(dictionaryValueArray,value).label
                return
            }
        },
        mounted() {
            Promise.all([this.initSelect(),this.initAuxiliaryMachineAbout()]).then(()=>{this.initFormData()})
        },
        methods: {
            initSelect(){
                this.initBoilerModel()
                initMedium().then(data=>{this.mediumArray=data})
                initFuel().then(data=>{this.fuelArray=data})
                initIsSell().then(data=>{this.isSellArray=data})
            },
            initBoilerModel(){
                getBoilerModelListByCondition({orgId:this.$store.state.user.orgId,orgType:this.$store.state.user.orgType}).then(data=>{
                    this.boilerModelNumberArray=data.data.data
                })
            },
            initAuxiliaryMachineAbout(){
                getAuxiliaryMachineLargeClassListByCondition({}).then(response=>{
                    this.largeClassOptions=this.getAuxiliaryMachineAboutOptions(response.data.data)
                })
                getAuxiliaryMachineSmallClassListByCondition({}).then(response=>{
                    this.smallClassOptions=this.getAuxiliaryMachineAboutOptions(response.data.data)
                })
            },
            getAuxiliaryMachineAboutOptions(dataList){
                let options=[]
                dataList.forEach(item=>{
                    let optionItem={}
                    optionItem.value=item.id
                    optionItem.label=item.name
                    options.push(optionItem)
                })
                return options
            },
            initFormData(){
                if(this.$route.query.title=='edit'){
                    document.title = '编辑';
                    this.productFormData=JSON.parse(this.$route.query.productFormData)
                }else if(this.$route.query.title=='create'){
                    document.title = '新增';
                }else if(this.$route.query.title=='copy'){
                    document.title = '复制';
                    this.productFormData=JSON.parse(this.$route.query.productFormData)
                    this.productFormData.roleIdArray=this.$store.state.user.roleIdArray
                    this.productFormData.userId=this.$store.state.user.userId
                    this.productFormData.orgId=this.$store.state.user.orgId
                    this.productFormData.orgType=this.$store.state.user.orgType
                    this.productFormData.createDateTime=formatDateTime(new Date(),"yyyy-MM-dd hh:mm:ss")
                }
            },
            handleAddBoilerModel(){
                let width= Math.round(document.body.clientWidth/2)+175
                let height= Math.round(document.body.clientHeight/2)+210
                let newWindow=openElectronWindow("/boiler-model-complete-page",{width: width, height: height})
                newWindow.on('closed', () => {
                    this.initBoilerModel()
                    newWindow = null
                })
            },
            submitForm() {
                this.$refs.productForm.validate(valid => {
                    if (valid) {
                        if(this.$route.query.title=='edit'){
                        }else if(this.$route.query.title=='create'){
                        }else if(this.$route.query.title=='copy'){
                            this.productFormData.id=''
                        }
                        editProduct(this.productFormData).then(() => {
                            ipcRenderer.send('handleCloseProductForm')
                        })
                    } else {
                        return false
                    }
                })
            }
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss">
    .product-footer{
        float: right;
    }
</style>