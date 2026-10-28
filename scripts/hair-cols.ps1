Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-hair-duo.png")
$counts = New-Object int[] $img.Width
for ($x = 0; $x -lt $img.Width; $x += 4) {
  $n = 0
  for ($y = 0; $y -lt $img.Height; $y += 4) {
    if ($img.GetPixel($x, $y).A -gt 40) { $n++ }
  }
  $counts[$x] = $n
}
$line = ""
for ($x = 0; $x -lt $img.Width; $x += 20) {
  $line += ("{0,4}:{1,-3}" -f $x, $counts[$x])
}
Write-Output $line
$img.Dispose()
