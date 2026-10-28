Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-2d-male.png")
foreach ($y in 150,168,400,480,540,580,640,700,760) {
  $parts = @()
  $run = ""
  $start = 0
  for ($x = 250; $x -lt 620; $x += 4) {
    $c = $img.GetPixel($x, $y)
    $k = " "
    if ($c.A -gt 30) {
      if ($c.R -lt 20 -and $c.G -lt 20) { $k = "K" }
      elseif ($c.R -gt 200 -and $c.G -gt 140) { $k = "S" }
      elseif ($c.R -gt 70 -and $c.G -lt 90) { $k = "B" }
      else { $k = "o" }
    }
    if ($k -ne $run) {
      if ($run -ne "" -and $run -ne " ") { $parts += "$run $start-$x" }
      $run = $k; $start = $x
    }
  }
  if ($run -ne "" -and $run -ne " ") { $parts += "$run $start-620" }
  Write-Output ("y={0} {1}" -f $y, ($parts -join " | "))
}
$img.Dispose()
