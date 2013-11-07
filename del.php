<?php
if(!isset($_POST["filepath"])){
  echo "Error";
  exit();
}

$filepath = "./files".$_POST["filepath"];
unlink($filepath) || rmdir($filepath);
?>
