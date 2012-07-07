## Installation

	<script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
	<script type="text/javascript" src="js/jquery.cb.waterfall.plugin.min.js"></script>
	<script type="text/javascript">
	$(function(){
		$("#photo_wall").waterflow({
			ajaxUrl			:"ajaxData.txt",			////ajax url. e.g. /server/loadMorePics.php. return json data as {["src":"2.jpg","desc":"description","link":"#"],["src":"4.jpg","desc":"description","link":"#"]}	
			ajaxParams		:{"count":20,"userId":30},	//ajax params. e.g. {"name":"chembo","loadPic":"10"}
			ajaxCount		:5,							//the total times of the ajax will run when scroll hits the bottom. default to 4.
			block_class		:"ablock",					//one block's width. default to ablock.
			margin			:3,							//the margin between two blocks. unit is the px. default to 3.
			block_width		:230,						//one block's width.
			animate_duration:500						//jquery animate duration. unit is the million-second. default to 1000.
		});
	});
[demo1](http://paradise4ever.com/waterfall/demo.html)
[demo2](http://paradise4ever.com/qt/detail.html#photo_wall)

