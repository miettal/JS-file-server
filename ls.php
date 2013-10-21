<?php

if(!isset($_GET["callback"])){
  exit();
}
$callback = $_GET["callback"];

if(!isset($_GET["dir"])){
  header("Content-Type: text/javascript; charset=utf-8");
  echo "$callback(".json_encode(array("status" => "error",
    "error_msg" => "dir is required.")).")";
  exit();
}

$dir = "./files".$_GET["dir"];
if(false === ($handle = opendir($dir))){
  header("Content-Type: text/javascript; charset=utf-8");
  echo "$callback(".json_encode(array("status" => "error",
    "error_msg" => "cannot chroot.")).")";
  exit();
}

$files = array();
while (false !== ($file = readdir($handle))) {
  $filename = $file;
  $filesize = filesize($dir.'/'.$file);
  $last_modified = filemtime($dir.'/'.$file);
  $type = is_dir($dir.'/'.$file) ? "directory" : "file";
  array_push($files, array(
    "filename" => $filename,
    "filesize" => $filesize,
    "last_modified" => $last_modified,
    "type" => $type,
  ));
}

closedir($handle);

header("Content-Type: text/javascript; charset=utf-8");
echo "$callback(".json_encode(array("status" => "success", "files" => $files)).")";

?>
