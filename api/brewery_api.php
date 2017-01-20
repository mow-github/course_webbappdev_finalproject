<?php
  const BREWERY_BASE_URL  = "http://api.brewerydb.com/v2/";
  const API_KEY           = ""; #API_KEY HERE

  echo ( file_get_contents(BREWERY_BASE_URL.$_POST['paramString'].'/?key='.API_KEY.'') );
?>

