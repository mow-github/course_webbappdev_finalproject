<?php
const FLICKR_BASE_URL = "https://api.flickr.com/services/rest/?";
const FLICKR_METHOD   = "flickr.photos.search";
$FLICKR_TEXT          = $_POST["paramString"];

const FLICKR_PERPAGE  = 30;
const FLICKR_PAGE     = 1;

const API_KEY         = ""; #API_KEY HERE
const API_SECRET      = ""; #API_SECRET HERE

echo ( file_get_contents(FLICKR_BASE_URL.'method='.FLICKR_METHOD.'&api_key='.API_KEY.'&text='.$FLICKR_TEXT.'&per_page='.FLICKR_PERPAGE.'&page='.FLICKR_PAGE.'&format=json&nojsoncallback=1') );

?>