const userDataKey = 'userData';
const defaultUser = 'guest-游客';

export function getUser() {
  try {
    let encryptedData;
    if (navigator.cookieEnabled) {
      encryptedData = getCookie(userDataKey);
    }
    if (!encryptedData && window.localStorage) {
      encryptedData = localStorage.getItem(userDataKey);
    }
    if (encryptedData) {
      const userInfo: any = decryptData(encryptedData);
      return !userInfo || !(userInfo instanceof Object) ? defaultUser : [userInfo.userCode, userInfo.userName].join('-')
    } else {
      return defaultUser;
    }
  } catch (error) {
    console.error('加载用户数据时出错:', error);
    return defaultUser;
  }
}

/**
 * @desc Cookie 读取
 * @param key
 * @returns {null|string}
 */
export function getCookie(key: string | null): null | string {
  let nameEQ = key + "=";
  let cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length) || '';
    }
  }
  return '';
}


/**
 * @desc 解密函数
 * @param encryptedData
 * @returns {any}
 */
export function decryptData(encryptedData: any): any {
  return JSON.parse(decodeURIComponent(encryptedData));
}
