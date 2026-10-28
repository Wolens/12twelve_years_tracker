Add-Type -AssemblyName System.Drawing
function Inspect($path) {
  $img = [System.Drawing.Bitmap]::FromFile((Resolve-Path $path))
  $minX = $img.Width; $minY = $img.Height; $maxX = 0; $maxY = 0
  $opaque = 0
  $sample = $null
  for ($y = 0; $y -lt $img.Height; $y += 2) {
    for ($x = 0; $x -lt $img.Width; $x += 2) {
      $c = $img.GetPixel($x, $y)
      if ($c.A -gt 20) {
        $opaque++
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
        if ($null -eq $sample) { $sample = "$($c.R),$($c.G),$($c.B),a=$($c.A)" }
      }
    }
  }
  Write-Output "$path $($img.Width)x$($img.Height) opaque~$opaque bounds=$minX,$minY-$maxX,$maxY sample=$sample"
  $img.Dispose()
}
Inspect "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-male.png"
Inspect "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-duo.png"
Inspect "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png"
