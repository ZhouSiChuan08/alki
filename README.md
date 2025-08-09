# alki
The Electron front-end source code of the local voice chat software alki based on ollama

本项目是本地语音对话聊天软件aiki的electron前端源码

使用本项目，你可以实现：

- 使用任意公开的支持ollama的模型（包含未审查模型）进行本地聊天
- 角色定制
- 情感化的语音聊天+外语翻译
- 音色克隆定制

其后端源码在：[ZhouSiChuan08/alkiserver: The C++ backend of the Alki local AI chat software](https://github.com/ZhouSiChuan08/alkiserver)

使用 [vue3](https://github.com/vuejs/core) ➕[vite](https://github.com/vitejs/vite) ➕[electron/electron: :electron: Build cross-platform desktop apps with JavaScript, HTML, and CSS](https://github.com/electron/electron) 搭建

### 部分页面截图

- 主页面

<img src="images\主页面.png" alt="主页面" style="zoom: 50%;" />

- 聊天页面

<img src="images\聊天页面.png" alt="聊天页面" style="zoom:50%;" />

- 联系人页面

<img src="images\联系人页面.png" alt="联系人页面" style="zoom:50%;" />

- 角色编辑

  

<img src="images\角色编辑.png" alt="角色编辑" style="zoom:50%;" />

- 音色克隆

  <img src="images\音色克隆.png" alt="音色克隆" style="zoom:50%;" />

- 模型配置

<img src="images\模型配置.png" alt="模型配置" style="zoom:50%;" />

- 沉浸聊天

  <img src="images\沉浸聊天.png" alt="沉浸聊天" style="zoom:50%;" />

### 如何使用？

### 1. 下载安装包并安装程序

[下载链接](https://drive.google.com/file/d/1P26kU1Bh0YJ0bZVw8Jmk0xP1T_4bt6WV/view?usp=sharing)

### 2.安装ollama并启动服务

 本地聊天模型基于[Ollama](https://ollama.com/)，取提前安装ollama并下载你喜欢的聊天模型。

下载链接：[Ollama](https://ollama.com/)

然后进入使用 `win+R` 键，输入`cmd`打开命令行窗口，再输入`ollama list`启动ollama服务

### 3.开启语音和翻译服务

- 开启文字转语音服务

​		本项目的语音服务由硅基流动的CosyVoice云服务提供支持，需注册后获取api

​		[点击注册硅基流动](https://cloud.siliconflow.cn/i/UkIKfeI2)

​		获取到api密钥后，打开`installed_dir\resources\cpp\config.json`，在**`ApiKey`**字段处填入你的api密钥

```json
"TTS": {
            "ApiKey": "",
            "SpkIds": [
                {
                    "沉稳男声": "FunAudioLLM/CosyVoice2-0.5B:alex",
                    "沉稳男声mp3Name": "沉稳男声.mp3"
                },
                {
                    "低沉男声": "FunAudioLLM/CosyVoice2-0.5B:benjamin",
                    "低沉男声mp3Name": "低沉男声.mp3"
                },
                {
                    "磁性男声": "FunAudioLLM/CosyVoice2-0.5B:charles",
                    "磁性男声mp3Name": "磁性男声.mp3"
                },
                {
                    "沉稳女声": "FunAudioLLM/CosyVoice2-0.5B:anna",
                    "沉稳女声mp3Name": "沉稳女声.mp3"
                },
                {
                    "温柔女声": "FunAudioLLM/CosyVoice2-0.5B:claire",
                    "温柔女声mp3Name": "温柔女声.mp3"
                }
            ]
        }
```

- 开启语音转文字服务

  本项目的语音转文字由`SenseVoice`的本地部署实现，已嵌入程序内，无需任何云服务api

- 开启翻译服务

  本项目的中文翻译由火山翻译提供支持，适用于外语学习场景，获取火山翻译api

​		[注册账号](https://console.volcengine.com/home)并选择机器翻译服务，获取相应`AccessKeyId`和`SecretKey`，然后在`installed_dir\resources\cpp\config.json`的**`translate`**字段内填入。

```json
"translate": {
            "AccessKeyId": "",
            "SecretKey": ""
        }
```





