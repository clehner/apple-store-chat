<?php
$html = file_get_contents('http://www.ifoapplestore.com/stores/job_store_list.html');
if (!$html) {
	die('Unable to get store list.');
}
if (!preg_match_all('/<li.*?R([0-9]{3}) - ([^<]*)/', $html, $m)) {
	die('Unable to get <li>s in store list');
}
$names = array();
foreach($m[2] as $i => $name) {
	if (strpos($name, '(') !== -2) {
		$names[$m[1][$i]] = trim(preg_replace(array(
			"/[\t\n ]+/",
			"/\s*\[.*/"
		), array(
			' ',
			'',
		), $name));
	}
}

//print_r($names);
//exit;

$stores = array();
foreach($names as $id => $name) {
	$stores[] = array('id' => $id, 'name' => $name);
}
$json = json_encode($stores);
print $json;