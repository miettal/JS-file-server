<?php
function remove_directory($dir) {
  if ($handle = opendir("$dir")) {
   while (false !== ($item = readdir($handle))) {
     if ($item != "." && $item != "..") {
       if (is_dir("$dir/$item")) {
         remove_directory("$dir/$item");
       } else {
         unlink("$dir/$item");
       }
     }
   }
   closedir($handle);
   rmdir($dir);
  }
}

if(!isset($_POST["filepath"])){
  echo "Error";
  exit();
}

$filepath = "./files".$_POST["filepath"];
unlink($filepath) || remove_directory($filepath);
?>
