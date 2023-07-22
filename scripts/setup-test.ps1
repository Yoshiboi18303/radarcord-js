Write-Output "Starting the test build, please do not interrupt this process..."

$originalPath = "$env:USERPROFILE\Desktop\radarcord-js"

# Get the package JSON content and turn it into a PowerShell object.
$jsonContent = Get-Content -Path ./package.json
$json = $jsonContent | ConvertFrom-Json

Write-Output "Making tarball..."
npm run pack

Clear-Host

Write-Output "Installing to testing project..."
Set-Location "$env:USERPROFILE\Desktop\Radarcord-js Testing"

$path = "$env:USERPROFILE\Desktop\Tarballs"

# Get our tarball name then install the tarball
$author = $json.author.ToLower()
$packageName = $json.name.Replace("@yoshiboi18303/", "")
$version = $json.version

$tarballName = "$author-$packageName-$version.tgz"

npm install "$path\$tarballName"

Set-Location $originalPath

Write-Output "Done!"
