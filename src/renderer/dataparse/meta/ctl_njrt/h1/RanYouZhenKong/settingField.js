import parentMockField from '../../mockField'
import {deviceModel} from "../../../../model/sdcSoftDevice";
export default class settingField extends parentMockField {
    setDeviceFieldForUIKey(deviceFieldForUI){
        deviceFieldForUI.key=deviceModel.key_setting
    }
    haveValue(...bytes){
        let i = getUnit32Number(bytes)
        if(0x7FFF == i){
            return false
        }
        if(this.baseNumber>0){
            this.value = i.getFloat32Number/this.baseNumber
        }else{
            this.value = i.getFloat32Number
        }
        return true

    }
    getValueString(){
        if (JSON.stringify(this.valueMap) != '{}') {
            return this.valueMap[this.value]
        } else {
            return super.getValueString()
        }
    }
}