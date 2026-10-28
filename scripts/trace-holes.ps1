Add-Type -AssemblyName System.Drawing
function Trace($path, $label) {
  $img = [System.Drawing.Bitmap]::FromFile($path)
  Write-Output "=== $label $($img.Width)x$($img.Height) ==="
  for ($y = 0; $y -lt $img.Height; $y += [Math]::Max(1, [int]($img.Height / 24))) {
    $xs = New-Object System.Collections.Generic.List[int]
    for ($x = 0; $x -lt $img.Width; $x += 2) {
      if ($img.GetPixel($x, $y).A -gt 80) { [void]$xs.Add($x) }
    }
    if ($xs.Count -lt 4) { continue }
    $best = 0; $gl = 0; $gr = 0
    for ($i = 1; $i -lt $xs.Count; $i++) {
      $gap = $xs[$i] - $xs[$i - 1]
      if ($gap -gt $best) { $best = $gap; $gl = $xs[$i - 1]; $gr = $xs[$i] }
    }
    if ($best -gt 60) {
      Write-Output ("y={0,4} hole {1,4}-{2,4} w={3}" -f $y, $gl, $gr, $best)
    }
  }
  $img.Dispose()
}
Trace "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-male.png" "male"
Trace "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png" "female"
