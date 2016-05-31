(function($,window,undefined) {
	if(!Array.indexOf){
		Array.prototype.indexOf = function(el){
			for (var i=0,n=this.length; i<n; i++){
				if (this[i] === el){
					return i;
				}
			}
			return -1;
		}
	}
	var rootPath = Svc.rootPath(),
	pluginName = "fileUploader",fileListPrex = "thelist", containterName= "uploaderContainPrex",
	imgRegExp = /^(gif|jpg|jpeg|bmp|png)$/i, officeRegExp = /^(doc|docx|xls|xlsx|ppt|pptx)$/i,docExp = /^\.(doc|docx)$/i, xlsRegExp = /^\.(xls|xlsx)$/i, pptRegExp = /^\.(ppt|pptx)$/i, 
	defaults = {
		acceptExt :'gif,jpg,jpeg,bmp,png,GIF,JPG,JPEG,BMP,PNG,doc,xls,docx,xlsx,DOC,XLS,DOCX,XLSX,ppt,PPT,pptx,PPTX,java,txt,jar,rar,zip,chm,pdf,PDF',
		btns : ["picker","ctlBtn","downFileBtn","delFileBtn"],
		btnsClass : ["uploader-pick", "uploader-up", "uploader-down", "uploader-del"],
		btnsName : ["选择文件","开始上传","下载附件","删除附件"]
	};
	var uploaderFileSvc = {
		url : {
			delAttaByType : rootPath + "common/delAttaByType.html?t=" + new Date().getTime(),
			zipDownAtta : rootPath + "common/zipDownAtta.html?t=" + new Date().getTime(),
			findAttaByFromIdAndTable : rootPath + "common/findAttaByFromIdAndTable.html?t=" + new Date().getTime(),
			openOffice: rootPath + "common/openOffice.html"
		},
		fnDelFile: function(uploader, delFiles, type) {
            var newFiles = [], attIds = [], fileId;
            $.each(delFiles, function() {
                var $obj = $(this);
                $obj.attr("data-newFile") && newFiles.push($obj.attr("data-newFile"));
                $obj.attr("data-attId") && attIds.push($obj.attr("data-attId"));
            });
            if (newFiles.length > 0) {
                var params = {};
                params.fileNames = newFiles;
                params.ids = attIds;
                params.foldType = type;
                Svc.AjaxJson.post(uploaderFileSvc.url.delAttaByType, params, function(v) {
                    art.dialog.alert("删除成功！");
                    $.each(delFiles, function(i, v) {
                        $(this).parent().remove();
                        fileId = $(this).attr("data-fileId");
                        fileId && uploader.removeFile(uploader.getFile(fileId));
                    });
                });
            } else {
                art.dialog.alert("删除成功！");
                $.each(delFiles, function(i, v) {
                    $(this).parent().remove();
                    fileId = $(this).attr("data-fileId");
                    fileId && uploader.removeFile(uploader.getFile(fileId));
                });
            }
        },
		fnZipDownFile: function(files,type){
			var params = {};
			params.fileNames = files;
			params.type = type;
			window.location.href=uploaderFileSvc.url.zipDownAtta+"&"+$.param(params);
		}
	}
	if (!window.FileUploader){
		window.FileUploader = function(){};
	}
	FileUploader = function(element, options) {
        this.isCanVisible = false;
        this.fileSize = 0;
        this.$element = $(element);
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
        this.initWebUploader();
        this.registerEvents();
    };
	FileUploader.prototype = {
		init : function(){	
			var _this = this, r;
            var _defaults = this._defaults, btns = this._defaults.btns;//["picker","ctlBtn","downFileBtn","delFileBtn"]
            _this.r = r = parseInt(100 * Math.random());
            _this.$uploadBtn = $("#" + btns[1] + this.r);
            _this.$downFileBtn = $("#" + btns[2] + this.r);
            _this.$delFileBtn = $("#" + btns[3] + this.r);
            _this.$containter = $('<div id="' + containterName + _this.r + '" class="uploader-list-container-file" ></div>').appendTo(_this.$element);
            _this.$fileListContainter = $('<div id="' + fileListPrex + _this.r + '" class="uploader-list"></div>').appendTo(_this.$containter);
            _this.$checkAllContainter = $('<div  style="opacity: 1;text-align:left" >' + '<input type="checkbox" name="selectFileAll" style="margin-top: 0;cursor:auto"/>' + '<span style="font-size:10px">全选/反选</span>' + "</div>").appendTo(_this.$fileListContainter);
            _this.$operBtnsContanter = $('<div class="btns"></div>').appendTo(_this.$containter);
			var btnDivContain,k;
			$.each(_this.settings.btns,function(i,v){
				if((k = _defaults.btns.indexOf(v))>=0){
					btnDivContain +=['<div id=',v+r,' class="_btn ',_defaults.btnsClass[k],'" style="margin-right:10px;">',_defaults.btnsName[k],'</div>'].join("");
				}
			});
			if (_this.settings.btns.length == 1 && k == 2) {
                _this.isCanVisible = true;
            }
			$(btnDivContain).appendTo(_this.$operBtnsContanter);
		},
		initWebUploader : function(){
			var  _this=this,state = 'pending',$uploadBtn = _this.$uploadBtn,$fileList = _this.$fileListContainter,type= _this.settings.type;
			var option ={
					headers :{
	        			accept:"*/*"
	        		},
	        		accept :{
	        			extensions: _this.settings.acceptExt
	        		},
			        resize: false,
			        fileVal: 'ajaxFile',
			        swf: rootPath + 'common/plugin/webuploader/0.1.5/Uploader.swf',
					server: rootPath + 'common/saveAttaInMul.html?t='+Math.random(),
			        pick: '#picker'+this.r,
			        fileSingleSizeLimit: 20 * 1024 * 1024,    // 20 M
			        fileSizeLimit: 200 * 1024 * 1024    // 200 M
			    };
			var formData = {
                fromId: _this.settings.fromId,
                fromTable: _this.settings.fromTable,
                foldType: _this.settings.foldType
            };
            var uploader = WebUploader.create($.extend({}, option, {
                formData: formData
            }));
			_this.uploader = uploader;// 当有文件添加进来的时候
		    uploader.on( 'fileQueued', function( file ) {
				$fileList.append('<div id="' + file.id + '"  class="item" style="float:left;margin-right:10px;width:150px;height:30px;">' + '<input type="checkbox" name="operFile" data-oldFile="' + file.name + '" data-fileId="' + file.id + '" style="float:left;margin-right:5px;cursor:auto">' + '<a title="' + file.name + '" class="fileName" style="float:left;display:inline-block;">' + file.name + "</a>" + '<span class="ok" style="float:left;margin-left:5px;display:none"></span>' + "</div>");
		    });
		    uploader.on( 'uploadSuccess', function( file,response ) {
				var datas = response.data;
		    	if(!datas&&response._raw){
					var error = $.parseJSON(response._raw);
		    		top.art.dialog.alert(error.errormsg);
					$("#"+file.id).remove();
					file && uploader.removeFile(uploader.getFile(file.id));
				}else if(datas){
					var $file = $("#"+file.id),path="",newfileName="";
					newfileName = datas["newFileName"];
					path = rootPath+'upload/'+type+'/'+newfileName;
					if(imgRegExp.test(newfileName)){
						$file.find("a.fileName").attr("data-imgFlag","1");
					}else {
						if (officeRegExp.test(file.ext)) {
							$file.find("a.fileName").attr("data-imgFlag", "2");
						}
					}
					$file.find("input[name='operFile']").attr("data-flag","1");
					$file.find("input[name='operFile']").attr("data-newFile",newfileName);
					$file.find("input[name='operFile']").attr("data-attId",datas["id"]?datas["id"]:"");
					$file.find("a.fileName").attr("data-href",path);
					$file.find('span.ok').css("display","block");
				}
		    });
		    uploader.on( 'uploadError', function( file ) {
		        $( '#'+file.id ).find('span.ok').css("display","none");
		    });
		    uploader.on( 'all', function( type ) {
				if (type === "startUpload") {
                    state = "uploading";
                } else {
                    if (type === "stopUpload") {
                        state = "paused";
                    } else {
                        if (type === "uploadFinished") {
                            state = "done";
                            $(".form-actions input[type='button']").removeAttr("disabled");
                        }
                    }
                }
                if (state === "uploading") {
                    $uploadBtn.text('暂停上传');
                    $(".form-actions input[type='button']").attr("disabled", "disabled");
                } else {
                    $uploadBtn.text('开始上传');
                }
		    });
			uploader.onError = function(code) {
                switch (code) {
                  case "F_DUPLICATE":
                    art.dialog.alert("不能同时上传文件相同文件", {
                        icon: 6
                    });
                    break;

                  case "Q_EXCEED_NUM_LIMIT":
                    art.dialog.alert("已达允许上传文件数量！", {
                        icon: 6
                    });
                    break;

                  case "F_EXCEED_SIZE":
                    art.dialog.alert("单个文件超出20M！", {
                        icon: 6
                    });

                  case "Q_EXCEED_SIZE_LIMIT":
                    art.dialog.alert("上传文件超出200M！", {
                        icon: 6
                    });

                  case "Q_TYPE_DENIED":
                    art.dialog.alert("上传文件格式错误！", {
                        icon: 6
                    });

                  default:
                    art.dialog.alert("错误: " + code, {
                        icon: 6
                    });
                    break;
                }
            };
	        $uploadBtn.live( 'click', function() {
		        if ( state === 'uploading' ) {
		            uploader.stop();
		        } else {
		            uploader.upload();
		        }
		    });
		},
		loaderData: function(opt) {
            var _this = this;
            _this.fileSize = 0;
            var isCanVisible = _this.isCanVisible, _settings = $.extend({}, _this.settings, opt), _fileListContainter = _this.$fileListContainter;
            var param = {}, size = 0;
            param.fromId = _settings.fromId;
            param.fromTable = _settings.fromTable;
            Svc.AjaxJson.sPost(uploaderFileSvc.url.findAttaByFromIdAndTable, param, function(data) {
                var path = "";
                if (data.length > 0) {
                    _fileListContainter.find(".item").remove();
                    size = data.length;
                    $.each(data, function(i, v) {
                        var imgFlag = "0", ext = v.newFileName.substring(v.newFileName.lastIndexOf(".") + 1);
                        if (imgRegExp.test(ext)) {
                            imgFlag = "1";
                        } else {
                            if (officeRegExp.test(ext)) {
                                imgFlag = "2";
                            }
                        }
                        path = rootPath + "upload/" + _settings.type + "/" + v.newFileName;
                        _fileListContainter.append('<div class="item" style="float:left;margin-right:10px;width:150px;height:30px;">' + '<input type="checkbox" name="operFile" data-oldfile="' + v.oldFileName + '" style="float:left;margin-right:5px;cursor:auto" data-flag="1" data-newfile="' + v.newFileName + '" data-attid="' + v.id + '">' + '<a title="' + v.oldFileName + '" class="fileName" style="float:left;display:inline-block;" data-imgflag="' + imgFlag + '" data-href="' + path + '" >' + v.oldFileName + "</a>" + '<span class="ok" style="float: left; margin-left: 5px; display: block;"></span>' + "</div>");
                    });
                } else {
                	if(isCanVisible){
                		if("TD"!=_this.$element.parent()[0].tagName.toLocaleUpperCase()){
                			_fileListContainter.parent().html('<input type="text" class="m-wrap span12" disabled="disabled" readonly="readonly">');
                		}else{
                			_fileListContainter.parent().html("");
                		}
                	}	
                }
            });
            _this.fileSize = size;
        },
		registerEvents : function(){
			var _this = this, _fileListContainter = _this.$fileListContainter, _type = _this.settings.type, uploader = _this.uploader;
            _fileListContainter.find("input[name='selectFileAll']").click(function() {
                var obj = $(this);
                if ("checked" == obj.attr("checked")) {
                    _fileListContainter.find("input[type='checkbox'][name='operFile']").attr("checked", "checked");
                } else {
                    _fileListContainter.find("input[type='checkbox'][name='operFile']").removeAttr("checked");
                }
            });
            _this.$delFileBtn.live("click", function() {
                var delFiles = _fileListContainter.find("input[type='checkbox'][name='operFile']:checked");
                if (delFiles.length == 0) {
                    art.dialog.alert("请选择要删除的附件！");
                } else {
                    art.dialog.confirm("确定删除选中的附件吗？", function() {
                        uploaderFileSvc.fnDelFile(uploader, delFiles, _type);
                    });
                }
            });
            _this.$downFileBtn.live("click", function() {
                var downFiles;
                downFiles = _fileListContainter.find("input[type='checkbox'][name='operFile']:checked");
                flagFiles = _fileListContainter.find("input[type='checkbox'][name='operFile'][data-flag='1']:checked");
                if (downFiles.length == 0) {
                    art.dialog.alert("请选择要下载的附件！");
                    return;
                } else {
                    if (flagFiles.length != downFiles.length) {
                        art.dialog.alert("勾选附件中还有尚未上传的附件！");
                        return;
                    } else {
                        art.dialog.confirm("确定下载选中的附件吗？", function(index) {
                            var files = "";
                            if (downFiles.length > 10) {
                                art.dialog.alert("批量下载附件最多10个附件！");
                                return;
                            }
                            $.each(downFiles, function(i, v) {
                                files += $(this).attr("data-newFile") + "#" + $(this).attr("data-oldFile") + ";";
                            });
                            uploaderFileSvc.fnZipDownFile(files, _type);
                        });
                    }
                }
            });
            $("a[class='fileName'][data-imgflag='1']", _this.$element).live("click", function() {
                var $obj = _fileListContainter.find("a[class='fileName'][data-imgflag='1']");
                var config = {};
                config.activeImage = $(this).attr("data-href");
                config.aData = $obj;
                config.operType = "all";
                top.API.showImg(config);
            });
            //office后缀名打开
            $("a[class='fileName'][data-imgflag='2']", _this.$element).live("click", function() {
                var _obj = $(this), 
                _href = _obj.attr("data-href"), 
                title = _obj.attr("title"),
				ext = title.substring(title.lastIndexOf(".")), 
				type = _href.substring(_href.indexOf("upload/") + 6, _href.length), 
				suffix = type + "&" + title + "&";
                if (docExp.test(ext)) {
                    suffix += "doc";
                } else {
                    if (xlsRegExp.test(ext)) {
                        suffix += "xls";
                    } else {
                        if (pptRegExp.test(ext)) {
                            suffix += "ppt";
                        }
                    }
                }
                window.open(uploaderFileSvc.url.openOffice + "?" + suffix);
            });
            //其他后缀名打开方式
            $("a[class='fileName'][data-imgflag='0']", _this.$element).live("click", function() {
                var obj = $(this);
                window.open(obj.attr("data-href"));
            });
			
		},
		getUploadFiles : function(){
			var flagFiles =this.$fileListContainter.find("input[type='checkbox'][name='operFile'][data-flag='1']");
			var oldFileNames = [],newFileNames=[];
			$.each(flagFiles,function(){
				var _this = $(this);
				if(!_this.attr("data-attId")){
					oldFileNames.push(_this.attr("data-oldFile"));
					newFileNames.push(_this.attr("data-newFile"));
				}
			});
			return {
				oldFileNames: oldFileNames,
				newFileNames : newFileNames
			}
		}
	};
	
})(jQuery,window);
