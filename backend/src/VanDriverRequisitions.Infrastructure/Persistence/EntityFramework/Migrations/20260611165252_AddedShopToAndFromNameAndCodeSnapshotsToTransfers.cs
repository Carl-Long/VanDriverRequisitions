using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class AddedShopToAndFromNameAndCodeSnapshotsToTransfers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ShopCodeFrom",
                table: "FeTransfers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShopCodeTo",
                table: "FeTransfers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShopNameFrom",
                table: "FeTransfers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShopNameTo",
                table: "FeTransfers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShopCodeFrom",
                table: "FeTransfers");

            migrationBuilder.DropColumn(
                name: "ShopCodeTo",
                table: "FeTransfers");

            migrationBuilder.DropColumn(
                name: "ShopNameFrom",
                table: "FeTransfers");

            migrationBuilder.DropColumn(
                name: "ShopNameTo",
                table: "FeTransfers");
        }
    }
}
