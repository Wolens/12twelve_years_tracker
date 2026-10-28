Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-hair-male.png")
# row y=360 is mid-cheek in the 520px image
$y = 360
$line = ""
for ($x = 60; $x -le 120; $x += 2) {
  $c = $img.GetPixel($x, $y)
  $line += ("{0}:{1} " -f $x, $c.A)
}
Write-Output "y360 $line"
$img.Dispose()
