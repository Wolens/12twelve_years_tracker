Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png")
Write-Output "size $($img.Width)x$($img.Height)"
for ($y = 0; $y -lt $img.Height; $y += 40) {
  $parts = @()
  $run = $null
  for ($x = 0; $x -lt $img.Width; $x += 4) {
    $c = $img.GetPixel($x, $y)
    $kind = " "
    if ($c.A -gt 40) {
      if ($c.R -gt 180 -and $c.G -gt 140 -and $c.B -gt 90) { $kind = "S" }
      elseif ($c.R -gt 120 -and $c.G -lt 140) { $kind = "H" }
      else { $kind = "o" }
    }
    if ($kind -eq $run) { continue }
    if ($null -ne $run -and $run -ne " ") { $parts += "$run@$x" }
    $run = $kind
  }
  if ($parts.Count -gt 0) { Write-Output ("y={0,4} {1}" -f $y, ($parts -join " ")) }
}
$img.Dispose()
