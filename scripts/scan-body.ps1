Add-Type -AssemblyName System.Drawing
function Scan($path) {
  $img = [System.Drawing.Bitmap]::FromFile($path)
  Write-Output "=== $path $($img.Width)x$($img.Height) ==="
  for ($y = 0; $y -lt $img.Height; $y += 24) {
    $left = -1; $right = -1
    for ($x = 0; $x -lt $img.Width; $x += 2) {
      if ($img.GetPixel($x, $y).A -gt 40) { if ($left -lt 0) { $left = $x }; $right = $x }
    }
    if ($left -lt 0) { continue }
    $c = $img.GetPixel([int](($left+$right)/2), $y)
    Write-Output ("y={0,4} x={1,4}-{2,4} w={3,3} rgb={4},{5},{6}" -f $y, $left, $right, ($right-$left), $c.R, $c.G, $c.B)
  }
  $img.Dispose()
}
Scan "C:\Users\ruska\Desktop\website_my_year\public\hero-2d-male.png"
Scan "C:\Users\ruska\Desktop\website_my_year\public\hero-2d-female.png"
