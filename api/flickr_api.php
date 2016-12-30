<?php
const FLICKR_BASE_URL = "https://api.flickr.com/services/rest/?";
const FLICKR_METHOD   = "flickr.photos.search";
#const FLICKR_TEXT     = "British+Origin+Ales";
$FLICKR_TEXT          = $_POST["paramString"];

const FLICKR_PERPAGE  = 30;
const FLICKR_PAGE     = 1;


const API_KEY         = "33da35229caeb9c86931f80c12ebdbe4";
const API_SECRET      = "779105e0361531df";

#echo $PARAM;

echo ( file_get_contents(FLICKR_BASE_URL.'method='.FLICKR_METHOD.'&api_key='.API_KEY.'&text='.$FLICKR_TEXT.'&per_page='.FLICKR_PERPAGE.'&page='.FLICKR_PAGE.'&format=json&nojsoncallback=1') );

?>