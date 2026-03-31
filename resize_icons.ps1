Add-Type -AssemblyName System.Drawing

$basePath = Join-Path $PSScriptRoot 'icos'
$srcPath  = Join-Path $basePath 'icon-512.png'

$sizes = @(192, 144, 96, 72, 48)

foreach ($size in $sizes) {
    $img = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gfx.DrawImage($img, 0, 0, $size, $size)
    $gfx.Dispose()
    $img.Dispose()
    $outPath = Join-Path $basePath "icon-$size.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created icon-$size.png"
}

Write-Host "All icons created."
Get-Item "$basePath\icon-*.png" | Select-Object Name, Length
