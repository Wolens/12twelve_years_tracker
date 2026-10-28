Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-hair-duo.png")
$holes = @()
for ($y = 0; $y -lt $img.Height; $y += 8) {
  $xs = @()
  for ($x = 0; $x -lt $img.Width; $x += 4) {
    if ($img.GetPixel($x, $y).A -gt 80) { $xs += $x }
  }
  if ($xs.Count -lt 4) { continue }
  $left = $xs[0]; $right = $xs[$xs.Count - 1]
  # largest interior gap
  $gapL = $left; $gapR = $left; $best = 0
  for ($i = 1; $i -lt $xs.Count; $i++) {
    $gap = $xs[$i] - $xs[$i - 1]
    if ($gap -gt $best) { $best = $gap; $gapL = $xs[$i - 1]; $gapR = $xs[$i] }
  }
  if ($best -gt 80) {
    $holes += "{0}: hair {1}-{2} hole {3}-{4} w={5}" -f $y, $left, $right, $gapL, $gapR, $best
  }
}
$holes | Select-Object -First 40
Write-Output "----"
$holes | Select-Object -Last 15
$img.Dispose()
