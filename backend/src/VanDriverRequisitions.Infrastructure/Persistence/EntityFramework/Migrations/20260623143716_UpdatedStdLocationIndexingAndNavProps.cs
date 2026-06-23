using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedStdLocationIndexingAndNavProps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StdLocations_CollectionTypeId_IsActive",
                table: "StdLocations");

            migrationBuilder.DropIndex(
                name: "IX_StdLocations_ShopId_CollectionTypeId_LocationName",
                table: "StdLocations");

            migrationBuilder.DropIndex(
                name: "IX_StdLocations_ShopId_CollectionTypeId_PostCode",
                table: "StdLocations");

            migrationBuilder.DropIndex(
                name: "IX_StdLocations_ShopId_IsActive",
                table: "StdLocations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_CollectionTypeId_IsActive",
                table: "StdLocations",
                columns: new[] { "CollectionTypeId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_ShopId_CollectionTypeId_LocationName",
                table: "StdLocations",
                columns: new[] { "ShopId", "CollectionTypeId", "LocationName" });

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_ShopId_CollectionTypeId_PostCode",
                table: "StdLocations",
                columns: new[] { "ShopId", "CollectionTypeId", "PostCode" });

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_ShopId_IsActive",
                table: "StdLocations",
                columns: new[] { "ShopId", "IsActive" });
        }
    }
}
