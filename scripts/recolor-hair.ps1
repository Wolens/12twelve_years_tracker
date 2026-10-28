Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-duo.png"
# Tight crop of the wig: spikes through the cheek line, drop the long jaw guide.
$cropX = 120
$cropY = 0
$cropW = 580
$cropH = 520
$bmp = New-Object System.Drawing.Bitmap $cropW, $cropH
for ($y = 0; $y -lt $cropH; $y++) {
  for ($x = 0; $x -lt $cropW; $x++) {
    $c = $src.GetPixel($cropX + $x, $cropY + $y)
    if ($c.A -lt 16) {
      $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      continue
    }
    $a = [int][Math]::Min(255, [Math]::Round($c.A * 1.45))
    if ($c.A -gt 70) { $a = 255 }
    # Warm brown, slightly lighter where the source was only a soft edge.
    $k = if ($c.A -gt 140) { 0.0 } else { 0.28 }
    $r = [int](0x6e + (0xc4 - 0x6e) * $k)
    $g = [int](0x4b + (0x8a - 0x4b) * $k)
    $b = [int](0x32 + (0x58 - 0x32) * $k)
    $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, $r, $g, $b))
  }
}
$out = "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-male.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

# Face-hole center inside the crop (alpha < 16, between hair).
$minHy = 9999; $maxHy = 0; $sumCx = 0; $n = 0; $holeW = 0
for ($y = 0; $y -lt $cropH; $y += 4) {
  $xs = New-Object System.Collections.Generic.List[int]
  for ($x = 0; $x -lt $cropW; $x += 2) {
    if ($bmp.GetPixel($x, $y).A -gt 80) { [void]$xs.Add($x) }
  }
  if ($xs.Count -lt 4) { continue }
  $best = 0; $gl = 0; $gr = 0
  for ($i = 1; $i -lt $xs.Count; $i++) {
    $gap = $xs[$i] - $xs[$i - 1]
    if ($gap -gt $best) { $best = $gap; $gl = $xs[$i - 1]; $gr = $xs[$i] }
  }
  if ($best -gt 200) {
    if ($y -lt $minHy) { $minHy = $y }
    if ($y -gt $maxHy) { $maxHy = $y }
    $sumCx += ($gl + $gr) / 2
    $n++
    if ($best -gt $holeW) { $holeW = $best }
  }
}
$cx = if ($n -gt 0) { [int]($sumCx / $n) } else { 0 }
Write-Output "saved $cropW x $cropH holeY=$minHy-$maxHy holeCx=$cx holeW=$holeW"
$bmp.Dispose()
$src.Dispose()
