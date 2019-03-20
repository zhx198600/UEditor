


var wordImage = {};
var g = baidu.g,
	flashObj,flashContainer;

wordImage.init = function(opt, callbacks) {
	showLocalPath("localPath");
	createFlashUploader(opt, callbacks);
	addUploadListener();
	addOkListener();
};

function hideFlash(){
    flashObj = null;
    flashContainer.innerHTML = "";
}
function addOkListener() {
	dialog.onok = function() {
		if (!imageUrls.length) return;
		var urlPrefix = editor.getOpt('imageUrlPrefix'),
            images = domUtils.getElementsByTagName(editor.document,"img");
        editor.fireEvent('saveScene');
		for (var i = 0,img; img = images[i++];) {
			var src = img.getAttribute("word_img");
			if (!src) continue;
			for (var j = 0,url; url = imageUrls[j++];) {
				if (src.indexOf(url.original.replace(" ","")) != -1) {
					img.src = urlPrefix + url.url;
					img.setAttribute("_src", urlPrefix + url.url);  
					img.setAttribute("title",url.title);
                    domUtils.removeAttributes(img, ["word_img","style","width","height"]);
					editor.fireEvent("selectionchange");
					break;
				}
			}
		}
        editor.fireEvent('saveScene');
        hideFlash();
	};
    dialog.oncancel = function(){
        hideFlash();
    }
}

function addUploadListener() {
	g("upload").onclick = function () {
		flashObj.upload();
		this.style.display = "none";
	};
}

function showLocalPath(id) {
    var img = editor.selection.getRange().getClosedNode();
    var images = editor.execCommand('wordimage');
    if(images.length==1 || img && img.tagName == 'IMG'){
        g(id).value = images[0];
        return;
    }
	var path = images[0];
    var leftSlashIndex  = path.lastIndexOf("/")||0,  
        rightSlashIndex = path.lastIndexOf("\\")||0,
        separater = leftSlashIndex > rightSlashIndex ? "/":"\\" ;

	path = path.substring(0, path.lastIndexOf(separater)+1);
	g(id).value = path;
}

function createFlashUploader(opt, callbacks) {
    
    var i18n = utils.extend({},lang.flashI18n);
    
    for(var i in i18n){
        if(!(i in {"lang":1,"uploadingTF":1,"imageTF":1,"textEncoding":1}) && i18n[i]){
            i18n[i] = encodeURIComponent(editor.options.langPath + editor.options.lang + "/images/" + i18n[i]);
        }
    }
    opt = utils.extend(opt,i18n,false);
	var option = {
		createOptions:{
			id:'flash',
			url:opt.flashUrl,
			width:opt.width,
			height:opt.height,
			errorMessage:lang.flashError,
			wmode:browser.safari ? 'transparent' : 'window',
			ver:'10.0.0',
			vars:opt,
			container:opt.container
		}
	};

	option = extendProperty(callbacks, option);
	flashObj = new baidu.flash.imageUploader(option);
    flashContainer = $G(opt.container);
}

function extendProperty(fromObj, toObj) {
	for (var i in fromObj) {
		if (!toObj[i]) {
			toObj[i] = fromObj[i];
		}
	}
	return toObj;
}


function getPasteData(id) {
	baidu.g("msg").innerHTML = lang.copySuccess + "</br>";
	setTimeout(function() {
		baidu.g("msg").innerHTML = "";
	}, 5000);
	return baidu.g(id).value;
}

function createCopyButton(id, dataFrom) {
	baidu.swf.create({
			id:"copyFlash",
			url:"fClipboard_ueditor.swf",
			width:"58",
			height:"25",
			errorMessage:"",
			bgColor:"#CBCBCB",
			wmode:"transparent",
			ver:"10.0.0",
			vars:{
				tid:dataFrom
			}
		}, id
	);

	var clipboard = baidu.swf.getMovie("copyFlash");
	var clipinterval = setInterval(function() {
		if (clipboard && clipboard.flashInit) {
			clearInterval(clipinterval);
			clipboard.setHandCursor(true);
			clipboard.setContentFuncName("getPasteData");
		}
	}, 500);
}
createCopyButton("clipboard", "localPath");
