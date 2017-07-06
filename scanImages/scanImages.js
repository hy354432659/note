/**
 * 遍历图片文件夹下的图片列表，并写入加载JS文件中
 * @param argv[0] 是相对本JS文件的图片文件夹路径。例：如本JS文件和images文件夹在同一层目录下，则值为images；多目录则增加数组内的值，类似images,img。
 * @param argv[1] 是相对本JS文件的加载JS文件路径。例：同上，值唯一。
*/
var argv = process.argv.splice(2),
	fs = require('fs'),
	outJS = [],
	inPath = argv[0].indexOf(',') > 0 ? argv[0].split(',') : [argv[0]],
	outPath = argv[1],
	fileInfo = {
		b: 'var manifest = [',
		e: '];'
	};


/**
 * 处理某个类目下所有文件及目录
 * @param files 文件。也可能是目录
 * @param file_path 文件或目录的上级目录
 * @param callback 一个目录或文件的判断结果的回调
 * @param allFilesDoneCallback 所有文件处理完成后的回调函数
 */
function forFiles(files, file_path,callback,allFilesDoneCallback) {
	var arrlength=files.length;
	if(!files||files.length==0){
		allFilesDoneCallback(file_path);
		return;
	}

	files.forEach(function (e, i) {
		var fullFilePath = file_path + '/' + e;

		fs.stat(fullFilePath, function (err, stat) {
			var result={
				isDir:false,
				isFile:true,
				file:fullFilePath
			};

			if (stat.isDirectory()) {
				result.isDir=true;
				result.isFile=false;
			}else{
				result.isDir=false;
				result.isFile=true;
			}
			//回调
			callback(result);
			arrlength--;
			//判断是否处理完毕
			if(arrlength==0){
				//回调所有文件处理完毕
				allFilesDoneCallback(file_path);
			}
		});
	});
}


/**
 * 处理单个目录
 * @param dirPath 目录路径
 * @param watchDir 监控的目录列表
 * @param callback 当目录处理完毕后的回调函数
 */
function forDir(dirPath,watchDir,callback){
	fs.readdir(dirPath, function (err, files) {
		var tempArr = [],
			subFiles= [];

		files.forEach(function(file){
			if(file.indexOf('.svn') < 0) {
				tempArr.push(file);
			}
		});

		forFiles(tempArr,dirPath,function(result){
			//如果是目录，继续执行forDir并在之前将目录添加到watchDir
			//如果是文件，放入subFiles中
			if(result.isDir){
				watchDir.push(result.file);
				forDir(result.file,watchDir,callback);
			}else{
				subFiles.push(result.file);
				outJS.push("	{src:'"+result.file+"', id:''}");
			}
		},function(processedDirPath){//文件全部处理完毕后，执行回调函数通知指定目录遍历完毕，但不包括子目录
			callback(processedDirPath,subFiles);
		});
	});
}


/**
 * 遍历处理多个类目
 * @param dirs 多个类目列表
 * @param doneCallback 处理完成的回调
 */
function forDirs(dirs,doneCallback) {
	var copiedDirs=dirs.slice(0),
		watchDir=[],
		allFiles=[];

	copiedDirs.forEach(function(path){
		watchDir.push(path);
		//回调函数中判断watchDir长度是否为0，如为0，表示所有的目录及其子目录处理完毕了，通知最外层处理完毕
		//并将返回的文件信息合并
		forDir(path,watchDir,function(processedDirPath,subFiles){
			allFiles=allFiles.concat(subFiles);
			console.log('%s 处理完成',processedDirPath);
			watchDir.splice(watchDir.indexOf(processedDirPath),1);
			if(watchDir.length==0){
				doneCallback(allFiles);
			}
		});
	});
}


/**
 * 写入js文件
 * @param data 写入的值
 */
function writeFile(data){
	fs.appendFile(outPath, data+"\n", function(err){
		if(err) throw err;
		console.log("写入成功");
	});
}


/**
 * 主体
 */
writeFile(fileInfo.b);
forDirs(inPath,function(fileList){
	console.log('所有目录遍历完成,获取到文件个数为:%d',fileList.length);
	writeFile(outJS.join(",\n") + "\n" + fileInfo.e);
});