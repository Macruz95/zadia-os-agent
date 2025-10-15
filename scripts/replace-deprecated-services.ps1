# Script para reemplazar imports de servicios deprecated

# Mapeo de funciones de inventory.service a FinishedProductsService
$inventoryMappings = @{
    'createFinishedProduct' = 'FinishedProductsService.createFinishedProduct'
    'updateFinishedProduct' = 'FinishedProductsService.updateFinishedProduct'
    'getFinishedProductById' = 'FinishedProductsService.getFinishedProductById'
    'getAllFinishedProducts' = 'FinishedProductsService.getAllFinishedProducts'
    'searchFinishedProducts' = 'FinishedProductsService.searchFinishedProducts'
    'deleteFinishedProduct' = 'FinishedProductsService.deleteFinishedProduct'
    
    'createRawMaterial' = 'RawMaterialsService.createRawMaterial'
    'updateRawMaterial' = 'RawMaterialsService.updateRawMaterial'
    'getRawMaterialById' = 'RawMaterialsService.getRawMaterialById'
    'getAllRawMaterials' = 'RawMaterialsService.getAllRawMaterials'
    'searchRawMaterials' = 'RawMaterialsService.searchRawMaterials'
    'deleteRawMaterial' = 'RawMaterialsService.deleteRawMaterial'
    
    'createMovement' = 'InventoryMovementsService.createMovement'
    'getMovementsByItem' = 'InventoryMovementsService.getMovementsByItem'
    'getRecentMovements' = 'InventoryMovementsService.getRecentMovements'
}

Write-Host "Inventory Service Replacements Mapping:" -ForegroundColor Cyan
$inventoryMappings.GetEnumerator() | ForEach-Object {
    Write-Host "  $($_.Key) -> $($_.Value)" -ForegroundColor Gray
}

Write-Host "`nEsta tarea requiere refactoring manual archivo por archivo para garantizar precisión." -ForegroundColor Yellow
Write-Host "Se procederá manualmente con las herramientas de edición." -ForegroundColor Yellow
