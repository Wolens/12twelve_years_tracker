Add-Type -AssemblyName System.Drawing

function Knockout($srcPath, $outPath, $mode) {
  $src = [System.Drawing.Bitmap]::FromFile($srcPath)
  $bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height
  $rect = New-Object System.Drawing.Rectangle 0, 0, $src.Width, $src.Height
  $srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $dstData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bytes = $srcData.Stride * $src.Height
  $buf = New-Object byte[] $bytes
  [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $buf, 0, $bytes)
  $src.UnlockBits($srcData)

  $w = $src.Width; $h = $src.Height; $stride = $srcData.Stride
  function IsBg([int]$i) {
    $b = $buf[$i]; $g = $buf[$i+1]; $r = $buf[$i+2]
    if ($mode -eq "black") { return ($r -lt 28 -and $g -lt 28 -and $b -lt 28) }
    return ($r -gt 242 -and $g -gt 242 -and $b -gt 242)
  }
  $qx = New-Object System.Collections.Generic.Queue[int]
  $qy = New-Object System.Collections.Generic.Queue[int]
  $seen = New-Object 'bool[,]' $w, $h
  foreach ($p in @(@(0,0),@(($w-1),0),@(0,($h-1)),@(($w-1),($h-1)))) {
    $qx.Enqueue($p[0]); $qy.Enqueue($p[1])
  }
  while ($qx.Count -gt 0) {
    $x = $qx.Dequeue(); $y = $qy.Dequeue()
    if ($x -lt 0 -or $y -lt 0 -or $x -ge $w -or $y -ge $h) { continue }
    if ($seen[$x,$y]) { continue }
    $i = $y * $stride + $x * 4
    if (-not (IsBg $i)) { continue }
    $seen[$x,$y] = $true
    $buf[$i+3] = 0
    $qx.Enqueue($x+1); $qy.Enqueue($y)
    $qx.Enqueue($x-1); $qy.Enqueue($y)
    $qx.Enqueue($x); $qy.Enqueue($y+1)
    $qx.Enqueue($x); $qy.Enqueue($y-1)
  }
  [System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $dstData.Scan0, $bytes)
  $bmp.UnlockBits($dstData)

  $minX=$w; $minY=$h; $maxX=0; $maxY=0
  for ($y=0; $y -lt $h; $y+=2) {
    for ($x=0; $x -lt $w; $x+=2) {
      $i = $y * $stride + $x * 4
      if ($buf[$i+3] -gt 20) {
        if ($x -lt $minX) { $minX=$x }
        if ($y -lt $minY) { $minY=$y }
        if ($x -gt $maxX) { $maxX=$x }
        if ($y -gt $maxY) { $maxY=$y }
      }
    }
  }
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output "$outPath $($w)x$($h) body=$minX,$minY-$maxX,$maxY"
  $bmp.Dispose(); $src.Dispose()
}

Knockout "C:\Users\ruska\.cursor\projects\c-Users-ruska-Desktop-website-my-year\assets\hero-2d-male.jpg" "C:\Users\ruska\Desktop\website_my_year\public\hero-2d-male.png" "black"
Knockout "C:\Users\ruska\.cursor\projects\c-Users-ruska-Desktop-website-my-year\assets\hero-2d-female.jpg" "C:\Users\ruska\Desktop\website_my_year\public\hero-2d-female.png" "white"
