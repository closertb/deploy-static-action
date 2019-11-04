# deploy-static-action  
关于构建参数：  
 - name：一个名字，自己随便啦，根据自己需要
 - token：这个比较重要，服务器的通关口令。这里最好的方式是通过项目的secrets来设置
 - dist：构建打包后的文件夹名，会根据这个文件夹名来获取其中的构建产物， 默认是dist
 - target：静态资源的目标文件夹名， 默认是dist
 - requestUrl：一个部署API

 ## 说明
 当前会对文件属性进行过滤，特殊格式的还不支持；
 >[txt|js|css|md|html|jpg|png|jpeg|gif|ico]

 ## 备注
 testDir 是用于用例测试的文件，与项目代码实现无关

 ## 操作
 npm run pub // 打包代码  
 npm run test // 用例测试