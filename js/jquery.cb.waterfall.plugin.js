/**
 * A jquery waterfall plugin. supports ajax and resize.
 * @created		2012-7-7
 * @modified	2012-7-7
 * @author		Chembo
 * @see			https://github.com/chembohuang/cb-jq-waterfall
 * @example $("#photo_wall").waterflow({
 * 			ajaxUrl			:"ajaxData.txt",
 * 			ajaxParams		:{"count":20,"userId":30},
 * 			ajaxCount		:5,
 * 			block_class		:"ablock",
 * 			margin			:3,
 * 			block_width		:230,
 * 			animate_duration:500
 * 		});
 * 	});
 */
(function($,window){
	$window = $(window);
	$.fn.waterfall = function(options){
        var $element = $(this);
		var settings = {
			block_width				:230,				//one block's width. 
			margin					:3,					//the margin between two blocks. unit is the px.
			block_class				:"ablock",			//blocks' class.
			ajaxUrl					:"",				//ajax url. e.g. /server/loadMorePics.php. return json data as {["src":"2.jpg","desc":"description","link":"#"],["src":"4.jpg","desc":"description","link":"#"]}
			ajaxParams				:{},				//ajax params. e.g. {"name":"chembo","loadPic":"10"}
			ajaxCount				:4,					//the total times of the ajax will run when scroll hits the bottom.
			animate_duration		:1000				//jquery animate duration. unit is the million-second.
		};
		var block_height, column_height, blocks, new_block, ablock_css, side_margin, start, isloading;
		function initParam(){
			$.extend(settings, options || {});	
			//the div which holds all the blocks.
			settings.parent_width = $element.width();
			//calculate how many columns can the container-div holds.
			settings.column = Math.floor(settings.parent_width/(settings.block_width+2*settings.margin));
			//to make the permutaion aling-center.
			settings.side_margin = (settings.parent_width - settings.column*(settings.block_width+2*settings.margin))/2;	
			//get the blocks.
			blocks = $element.children("."+settings.block_class);
			settings.block_count = blocks.length;
			ablock_css = {'width':settings.block_width,
				'margin':settings.margin,'padding-top':settings.margin};
			$("."+settings.block_class).css(ablock_css);
			start = 0, block_height = [], column_height=[], new_block = "<div class='ablock'><a target='_blank' href='{2}'>"+
									"<img class='pic' src='{0}' />"+
									"<p>{1}</p></a>"+
								"</div>";
			isloading = false;
		};
		function permutation(){
			settings.block_count = blocks.length;
			var min_height_column;
			//every new row, the permutation will starts with the min-height column.
			for (var i=start;i<settings.block_count;i++)
			{
				//the first row doesnt have to care the top-position.
				if(i<settings.column){
					$(blocks[i]).css({"top":settings.margin+"px",
						"left":(settings.block_width+2*settings.margin)*(i%settings.column)+settings.side_margin+"px"}).animate({ opacity: 'show' }, settings.animate_duration);
					column_height[i] = $(blocks[i]).height()+settings.margin;
				}
				//from the second row, every new row starts the permutation from min-height to max-height.
				else{
					min_height_column = column_height.min_index();
					$(blocks[i]).css({"top":(column_height[min_height_column]+4*settings.margin)+"px",
						"left":(settings.block_width+2*settings.margin)*(min_height_column)+settings.side_margin+"px"}).animate({ opacity: 'show' }, settings.animate_duration);
					column_height[min_height_column] += $(blocks[i]).height()+4*settings.margin;
				}
			}
			start = i;
			//after permutation, the container needs to resize to the new height.
			$element.height(column_height[column_height.max_index()]);
		};
		String.prototype.template=function(){
			var args=arguments;
			return this.replace(/\{(\d+)\}/g, function(m, i){
				return args[i];
			});
		};
		//return the max-height's index of the array.
		Array.prototype.max_index = function(){ 
			var max = this[0];
			var len = this.length; 
			var index = 0;
			for (var i = 1; i < len; i++){ 
				if (this[i] > max) { 
					max = this[i]; 
					index = i;
				} 
			} 
			return index;
		};
		//return the min-height's index of the array.
		Array.prototype.min_index = function(){ 
			var min = this[0];
			var len = this.length; 
			var index = 0;
			for (var i = 1; i < len; i++){ 
				if (this[i] < min) { 
					min = this[i]; 
					index = i;
				} 
			} 
			return index;
		};
		//the ajax function. you may replace the success-function with your own.
		function loadNew(){
			isloading = true;
			$("#loading").show();
			$.ajax({
				url: settings.ajaxUrl,
				type: 'post',
				data: settings.ajaxParams,
				dataType: 'json',
				success: function(data){
					$("#loading").hide();
					var new_blocks = "";
					$.each(data, function(i) {
						imgReady(data[i].src, function() {
							$element.append(new_block.template(data[i].src,data[i].desc,data[i].link));
							blocks.push($element.children(":last").css(ablock_css));
						});
					});
					permutation();	
					isloading = false;
					settings.ajaxCount--;
				}
			});
		};
		//supports re-permutation on window-resize. this needs you to set the container-div's width with percentage like 80% but not 800px;
		window.onresize = function() {
			initParam();
			permutation();
		};
		//after the scroll hit the bottom, the ajax will run.
		window.onscroll=function(){
			if(Math.abs(document.body.clientHeight - document.documentElement.clientHeight) <= (document.documentElement.scrollTop || document.body.scrollTop)){
				if(!isloading && settings.ajaxUrl!=""){
					if(settings.ajaxCount>0){
						loadNew();
					}
					else{
						$("#loading").hide();
						$("#nomore").show();
					}

				}
			}
		};
		//plugin's entrance.
		window.onload = function() {
			initParam();
			permutation();
		};
		
	};
	//the following code is copied from author TangBin, to get the img's widht & height before the whole img is loaded.

	/**
	 * 图片头数据加载就绪事件 - 更快获取图片尺寸
	 * @version	2011.05.27
	 * @author	TangBin
	 * @see		http://www.planeart.cn/?p=1121
	 * @param	{String}	图片路径
	 * @param	{Function}	尺寸就绪
	 * @param	{Function}	加载完毕 (可选)
	 * @param	{Function}	加载错误 (可选)
	 * @example imgReady('http://www.google.com.hk/intl/zh-CN/images/logo_cn.png', function () {
			alert('size ready: width=' + this.width + '; height=' + this.height);
		});
	 */
	var imgReady = (function () {
		var list = [], intervalId = null,

		// 用来执行队列
		tick = function () {
			var i = 0;
			for (; i < list.length; i++) {
				list[i].end ? list.splice(i--, 1) : list[i]();
			};
			!list.length && stop();
		},

		// 停止所有定时器队列
		stop = function () {
			clearInterval(intervalId);
			intervalId = null;
		};

		return function (url, ready, load, error) {
			var onready, width, height, newWidth, newHeight,
				img = new Image();

			img.src = url;

			// 如果图片被缓存，则直接返回缓存数据
			if (img.complete) {
				ready.call(img);
				load && load.call(img);
				return;
			};

			width = img.width;
			height = img.height;

			// 加载错误后的事件
			img.onerror = function () {
				error && error.call(img);
				onready.end = true;
				img = img.onload = img.onerror = null;
			};

			// 图片尺寸就绪
			onready = function () {
				newWidth = img.width;
				newHeight = img.height;
				if (newWidth !== width || newHeight !== height ||
					// 如果图片已经在其他地方加载可使用面积检测
					newWidth * newHeight > 1024
				) {
					ready.call(img);
					onready.end = true;
				};
			};
			onready();

			// 完全加载完毕的事件
			img.onload = function () {
				// onload在定时器时间差范围内可能比onready快
				// 这里进行检查并保证onready优先执行
				!onready.end && onready();

				load && load.call(img);

				// IE gif动画会循环执行onload，置空onload即可
				img = img.onload = img.onerror = null;
			};

			// 加入队列中定期执行
			if (!onready.end) {
				list.push(onready);
				// 无论何时只允许出现一个定时器，减少浏览器性能损耗
				if (intervalId === null) intervalId = setInterval(tick, 40);
			};
		};
	})();
})(jQuery,window);

