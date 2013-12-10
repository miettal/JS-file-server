<?php

if(!isset($_POST["dir"])){
  echo "Error";
  exit();
}

$dir = "./files".$_POST["dir"];

if(false === ($handle = opendir($dir))){
  echo "Error";
  exit();
}

foreach($_FILES as $file){
  if(false === move_uploaded_file($file["tmp_name"], $dir.$file["name"])){
    echo "Error";
  }

  echo "Success";
}

?>
