<?php
  # $METHOD                 = $_SERVER['REQUEST_METHOD'];
  # $REQUEST                = explode('/', trim($_SERVER['PATH_INFO'],'/'));

 # echo json_encode( $_POST['paramString'] );

  const BREWERY_BASE_URL  = "http://api.brewerydb.com/v2/";
  const API_KEY           = "0cea860199c341880cf183533a9c985e";
 # const PARAM             = "beer/4DCH9J/adjuncts/";

  echo ( file_get_contents(BREWERY_BASE_URL.$_POST['paramString'].'/?key='.API_KEY.'') );

?>

