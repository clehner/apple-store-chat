<?php
header("Content-type: application/xml");
print file_get_contents("http://www.apple.com/main/rss/retail/stores.xml");