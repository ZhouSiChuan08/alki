// 专门存放不涉及全局变量的工具函数
import { taskStatus } from "./consts";
import * as zmq from 'zeromq'
// 1 遍历对象内字符串类型的属性并去除前后空格 返回处理后的新对象
/**
 * @description 遍历对象内字符串类型的属性并去除前后空格 返回处理后的新对象
 * @param obj 要处理的对象
 * @returns  处理后的新对象
 */
export function trimObjectProperties<T extends Record<string, unknown>>(obj: T): T {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].trim() as T[typeof key];
        }
    }
    return obj;
}
// 2 输入zmq dealer套接字、dealerID, 发送消息，并捕获发送失败异常
/**
 * @description 发送zmqDealer消息，并捕获发送失败异常，返回是否发送成功
 * @param dealerSocket dealer套接字
 * @param dealerID     dealerID
 * @param msg          要发送的消息 string类型
 * @returns         是否发送成功
 */
export async function sendDealerMsg(dealerSocket: zmq.Dealer, dealerID: string, msg: string): Promise<boolean> {
    try {
        await dealerSocket.send([msg, 'END']);
        console.log(`${dealerID} 消息发送成功`);
        return true;
    } catch (error) {
        console.error(`${dealerID} 消息发送失败:`, error);
        return false;
    }
}
// 3 输入zmq dealer套接字、dealerID、等待时间s, 在规定时间内等待接收任务处理状态消息
/**
 * @description 等待接收后端任务处理的状态消息
 * @param dealerSocket dealer套接字
 * @param dealerID     dealerID
 * @param waitTime     等待时间s
 * @returns        任务是否处理成功
 */
export async function onlyStatusReturnTask(dealerSocket: zmq.Dealer, dealerID: string, waitTime: number): Promise<boolean> {
    const timeout = waitTime * 1000;  // 最大等待时间
    while (true) {
        let reply : any = null;
        let timer : any = null;
        try {
            // 使用Promise.race来进行超时控制和router的通信 有回复立即返回，超时则抛出超时错误
            reply = await Promise.race([
                dealerSocket.receive(),
                new Promise((resolve, reject) => {
                    timer = setTimeout(() => {
                        reject(new Error('Reply Timeout'));
                    }, timeout);
                })
            ]);
        } catch (error) {
            if (error.message === 'Reply Timeout') {
                clearTimeout(timer);     // 清除定时器
                console.error(`${dealerID} 接收router消息超时`);
                return false;  // 返回超时结果 停止循环
            }
            throw error;                 // 抛出非超时错误
        }
        clearTimeout(timer);             // 清除定时器
        if (reply[0].toString() === taskStatus.FAILURE + dealerID) {
            console.error(`${dealerID} 本次请求任务处理失败:`);
            return false;                // 本次请求失败 停止循环
        }
        if (reply[0].toString() === taskStatus.SUCCESS + dealerID) {
            console.log(`${dealerID} 本次请求任务处理成功`);
            return true;                 // 本次请求成功 停止循环
        }
    }
}

// 4 输入一个字符, 判断其语言类型
/**
 * @description 判断一个字符的语言类型
 * @param char 要判断的字符
 * @returns 对应语言类型 'japanese' | 'chinese' | 'korean' | 'english' | 'other'
 */
function getLanguageType(char: string): string {
    const code = char.charCodeAt(0);
    if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) return 'japanese'; // 假名
    if (code >= 0x4e00 && code <= 0x9fff) return 'chinese'; // 汉字，默认归为中文
    if (code >= 0xac00 && code <= 0xd7af) return 'korean';
    if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) return 'english';
    return 'other';
}

// 5 输入一个字母, 将其转换为大写字母, 非字母字符直接返回
/**
 * @description 将一个字母转换为大写字母
 * @param char  要转换的字符
 * @returns  转换后的大写字母
 */
function convertToUpper(char: string): string {
    // 判断是否为字母（a-z或A-Z）
    char = char.trim()
    if (/^[a-zA-Z]$/.test(char)) {
      return char.toUpperCase();
    }
    return char; // 非字母直接返回
}

// 6 输入一个数组, 元素都是对象, 遍历数组,为每个对象添加属性key:value, value从0递增
/**
 * @description 为数组中的每个对象添加属性key:value, value从0递增
 * @param array 要处理的对象数组
 * @returns 添加了0递增索引的新对象数组
 */
function addIndexToArr<T extends object>(array: T[]): T[] {
    return array.map((item, index) => ({
        key: index,
        ...item
    }))
}

// 7 具备非流式返回数据的任务处理函数
interface TaskResult {
    status: boolean;
    data: Array<any>;
}
/**
 * @description 具备非流式返回数据的任务处理函数
 * @param dealerSocket zmq.Dealer套接字
 * @param dealerID     dealerID
 * @param waitTime 延迟等待时间s
 * @returns zmq multipart_t消息数组 本函数为固定尺寸1
 */
async function nonStreamDataReturnTask(dealerSocket: zmq.Dealer, dealerID: string, waitTime: number): Promise<TaskResult> {
    const timeout = waitTime * 1000;  // 最大等待时间
    while (true) {
        let reply : any = null;
        let timer : any = null;
        try {
            // 使用Promise.race来进行超时控制和router的通信 有回复立即返回，超时则抛出超时错误
            reply = await Promise.race([
                dealerSocket.receive(),
                new Promise((resolve, reject) => {
                    timer = setTimeout(() => {
                        reject(new Error('Reply Timeout'));
                    }, timeout);
                })
            ]);
        } catch (error) {
            if (error.message === 'Reply Timeout') {
                clearTimeout(timer);     // 清除定时器
                console.error(`In nonStreamDataReturnTask, ${dealerID} 接收router消息超时`);
                return {status: false, data: ['']};  // 返回超时结果 停止循环
            }
            throw error;                 // 抛出非超时错误
        }
        clearTimeout(timer);             // 清除定时器
        if (reply[0].toString() === taskStatus.FAILURE + dealerID) {
            console.error(`In nonStreamDataReturnTask, ${dealerID} 本次请求任务处理失败:`);
            return {status: false, data: ['']};        // 本次请求失败 停止循环
        }
        return {status: true, data: reply};            // 本次请求成功 停止循环
    }
}

// 8 检测一个对象是否是空对象
/**
 * @description 检测一个对象是否是空对象
 * @param obj 要检测的对象
 * @returns boolean 是否是空对象
 */
function isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
}

// 9 UTC时转本地时 + 时区偏移
/**
 * @description UTC时转本地时 + 时区偏移
 * @param utcHour utc时
 * @param timezoneOffset 时区偏移 
 * @returns 本地时
 */
function utcHourToLocal(utcHour: number, timezoneOffset: number): number {
    let localHour = utcHour + timezoneOffset;
    if ( localHour >= 24 ) {
        localHour -= 24;
    }
    return localHour;
}

// 10 生成指定范围[min, max]内均匀分布随机数整数
/**
 * @description 生成指定范围[min, max]内均匀分布随机数整数
 * @param min 
 * @param max 
 * @returns 随机整数
 */
function randomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 对象导出
export const toolFuns = {
    trimObjectProperties,
    sendDealerMsg,
    onlyStatusReturnTask,
    getLanguageType,
    convertToUpper,
    addIndexToArr,
    nonStreamDataReturnTask,
    isEmptyObject,
    utcHourToLocal,
    randomInt,
} as const; // 增加类型断言, 函数就不会被覆盖修改