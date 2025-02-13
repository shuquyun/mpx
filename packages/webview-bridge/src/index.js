import loadScript from './loadscript'

const SDK_URL_MAP = {
  wx: 'https://res.wx.qq.com/open/js/jweixin-1.3.2.js',
  ali: 'https://appx/web-view.min.js',
  baidu: 'https://b.bdstatic.com/searchbox/icms/searchbox/js/swan-2.0.4.js',
  tt: 'https://s3.pstatp.com/toutiao/tmajssdk/jssdk.js'
}

const ENV_PATH_MAP = {
  wx: ['wx', 'miniProgram'],
  ali: ['my'],
  baidu: ['swan', 'webView'],
  tt: ['tt', 'miniProgram']
}

let env = null
// 环境判断
if (navigator.userAgent.indexOf('AlipayClient') > -1) {
  env = 'ali'
} else if (navigator.userAgent.indexOf('miniProgram') > -1) {
  env = 'wx'
} else if (navigator.userAgent.indexOf('swan') > -1) {
  env = 'baidu'
} else if (navigator.userAgent.indexOf('toutiao') > -1) {
  env = 'tt'
}

if (env === null) {
  console.error('mpxjs/webview: 未识别的环境，当前仅支持 微信、支付宝、百度、头条 小程序')
}
const sdkReady = !window[env] ? SDK_URL_MAP[env] ? loadScript(SDK_URL_MAP[env]) : Promise.reject(new Error('未找到对应的sdk')) : Promise.resolve()

let wxConfig = null

// 微信的非小程序相关api需要config配置
const sdkConfigReady = () => (env !== 'wx') ? sdkReady : new Promise((resolve, reject) => {
  sdkReady.then(() => {
    if (!window.wx) {
      reject(new Error('sdk未就绪'))
    }

    if (wxConfig === null) {
      reject(new Error('wxSDK 未配置'))
    }

    window.wx.config(wxConfig)
    window.wx.ready(() => {
      resolve()
    })

    window.wx.error((res) => {
      reject(res)
    })
  })
})

const wxsdkConfig = (config) => {
  wxConfig = config
}

function getEnvWebviewVariable () {
  return ENV_PATH_MAP[env].reduce((acc, cur) => acc[cur], window)
}

function getEnvVariable () {
  return window[ENV_PATH_MAP[env][0]]
}

// key为导出的标准名，对应平台不支持的话为undefined
const ApiList = {
  'checkJSApi': {
    wx: 'checkJSApi'
  },
  'chooseImage': {
    wx: 'chooseImage',
    baidu: 'chooseImage',
    ali: 'chooseImage'
  },
  'previewImage': {
    wx: 'previewImage',
    baidu: 'previewImage',
    ali: 'previewImage'
  },
  'uploadImage': {
    wx: 'uploadImage'
  },
  'downloadImage': {
    wx: 'downloadImage'
  },
  'getLocalImgData': {
    wx: 'getLocalImgData'
  },
  'startRecord': {
    wx: 'startRecord'
  },
  'stopRecord': {
    wx: 'stopRecord'
  },
  'onVoiceRecordEnd': {
    wx: 'onVoiceRecordEnd'
  },
  'playVoice': {
    wx: 'playVoice'
  },
  'pauseVoice': {
    wx: 'pauseVoice'
  },
  'stopVoice': {
    wx: 'stopVoice'
  },
  'onVoicePlayEnd': {
    wx: 'onVoicePlayEnd'
  },
  'uploadVoice': {
    wx: 'uploadVoice'
  },
  'downloadVoice': {
    wx: 'downloadVoice'
  },
  'translateVoice': {
    wx: 'translateVoice'
  },
  'getNetworkType': {
    wx: 'getNetworkType',
    baidu: 'getNetworkType',
    ali: 'getNetworkType'
  },
  'openLocation': {
    wx: 'openLocation',
    baidu: 'openLocation',
    ali: 'openLocation'
  },
  'getLocation': {
    wx: 'getLocation',
    baidu: 'getLocation',
    ali: 'getLocation'
  },
  'startSearchBeacons': {
    wx: 'startSearchBeacons'
  },
  'stopSearchBeacons': {
    wx: 'stopSearchBeacons'
  },
  'onSearchBeacons': {
    wx: 'onSearchBeacons'
  },
  'scanQRCode': {
    wx: 'scanQRCode'
  },
  'chooseCard': {
    wx: 'chooseCard'
  },
  'addCard': {
    wx: 'addCard'
  },
  'openCard': {
    wx: 'openCard'
  },
  'alert': {
    ali: 'alert'
  },
  'showLoading': {
    ali: 'showLoading'
  },
  'hideLoading': {
    ali: 'hideLoading'
  },
  'setStorage': {
    ali: 'setStorage'
  },
  'getStorage': {
    ali: 'getStorage'
  },
  'removeStorage': {
    ali: 'removeStorage'
  },
  'clearStorage': {
    ali: 'clearStorage'
  },
  'getStorageInfo': {
    ali: 'getStorageInfo'
  },
  'startShare': {
    ali: 'startShare'
  },
  'tradePay': {
    ali: 'tradePay'
  },
  'onMessage': {
    ali: 'onMessage'
  }
}

const exportApiList = {}

for (let item in ApiList) {
  exportApiList[item] = (...args) => {
    if (!ApiList[item][env]) {
      console.error(`此环境不支持${item}方法`)
    } else {
      sdkConfigReady().then(() => {
        getEnvVariable()[ApiList[item][env]](...args)
      }, (res) => {
        console.error(res)
      }).catch(e => console.error(e))
    }
  }
}

const webviewApiNameList = {
  navigateTo: 'navigateTo',
  navigateBack: 'navigateBack',
  switchTab: 'switchTab',
  reLaunch: 'reLaunch',
  redirectTo: 'redirectTo',
  getEnv: 'getEnv',
  postMessage: 'postMessage',
  onMessage: {
    ali: true
  }
}

const webviewApiList = {}

for (let item in webviewApiNameList) {
  const apiName = typeof webviewApiNameList[item] === 'string' ? webviewApiNameList[item] : !webviewApiNameList[item][env] ? false : typeof webviewApiNameList[item][env] === 'string' ? webviewApiNameList[item][env] : item

  webviewApiList[item] = (...args) => {
    if (!apiName) {
      console.log(`${env}小程序不支持 ${item} 方法`)
    } else {
      sdkReady.then(() => {
        getEnvWebviewVariable()[apiName](...args)
      }, (res) => {
        console.error(res)
      }).catch(e => console.log(e))
    }
  }
}

const bridgeFunction = {
  ...webviewApiList,
  ...exportApiList,
  wxsdkConfig
}

// 此处导出的对象包含所有的api
export default bridgeFunction
