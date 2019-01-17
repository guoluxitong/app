import device_CTL_RT_T2_RYZQ from "./device_CTL_RT_T2_RYZQ";

export default class device_CTL_RT_T2_RYZQ_YLKZQ extends device_CTL_RT_T2_RYZQ{
    constructor(){
        super()
        this.byteArrayLength=109
    }
    getBaseInfoFields(){
        let map=this.getFieldsMap(deviceModel.key_base)
        let runLife=map[this.deviceModel.key_point_run_life].value
        map[this.deviceModel.key_point_run_days].value=runLife/24
        map[this.deviceModel.key_point_run_hours].value=runLife%24
        return map
    }
}