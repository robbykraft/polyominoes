<!DOCTYPE html>
<title>svgs</title>
<style>
html, body {
	margin: 8px;
	font-family: sans-serif;
}
h1 { margin: 4rem; }
div {
	display: grid;
	grid-gap: 8px;
	grid-template-columns: repeat(3, 1fr);
}
@media (min-width: 800px) {
	div { grid-template-columns: repeat(6, 1fr); }
}
@media (min-width: 1200px) {
	div { grid-template-columns: repeat(12, 1fr); }
}
</style>
<body>
<h1>flat-foldable</h1>
<div>
<?php
foreach (new DirectoryIterator('./output/svgs/flat') as $file) {
    if($file->isDot()) continue;
    print '<img src="./output/svgs/flat/' . $file->getFilename() . '" alt="' . $file->getFilename() . '" title="' . $file->getFilename() . '"/>';
}
?>
</div>
<h1>3D</h1>
<div>
<?php
foreach (new DirectoryIterator('./output/svgs/3D') as $file) {
    if($file->isDot()) continue;
    print '<img src="./output/svgs/3D/' . $file->getFilename() . '" alt="' . $file->getFilename() . '" title="' . $file->getFilename() . '"/>';
}
?>
</div>
</body>