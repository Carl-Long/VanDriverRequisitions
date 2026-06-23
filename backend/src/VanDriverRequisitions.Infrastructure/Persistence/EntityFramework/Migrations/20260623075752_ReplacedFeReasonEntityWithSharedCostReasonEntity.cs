using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class ReplacedFeReasonEntityWithSharedCostReasonEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeReasons");

            migrationBuilder.DropColumn(
                name: "ReasonText",
                table: "FeAdditionalCosts");

            migrationBuilder.RenameColumn(
                name: "ReasonNameSnapshot",
                table: "StdAdditionalCosts",
                newName: "ReasonTextSnapshot");

            migrationBuilder.AddColumn<string>(
                name: "ReasonCodeSnapshot",
                table: "StdAdditionalCosts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReasonCodeSnapshot",
                table: "FeAdditionalCosts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReasonTextSnapshot",
                table: "FeAdditionalCosts",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "CostReasons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Scope = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CostReasons", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_ShopId_CollectionTypeId_IsActive",
                table: "StdLocations",
                columns: new[] { "ShopId", "CollectionTypeId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_FeAdditionalCosts_ReasonCodeSnapshot",
                table: "FeAdditionalCosts",
                column: "ReasonCodeSnapshot");

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_Code",
                table: "CostReasons",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_IsActive",
                table: "CostReasons",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_Reason",
                table: "CostReasons",
                column: "Reason");

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_Scope",
                table: "CostReasons",
                column: "Scope");

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_Scope_IsActive",
                table: "CostReasons",
                columns: new[] { "Scope", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CostReasons");

            migrationBuilder.DropIndex(
                name: "IX_StdLocations_ShopId_CollectionTypeId_IsActive",
                table: "StdLocations");

            migrationBuilder.DropIndex(
                name: "IX_FeAdditionalCosts_ReasonCodeSnapshot",
                table: "FeAdditionalCosts");

            migrationBuilder.DropColumn(
                name: "ReasonCodeSnapshot",
                table: "StdAdditionalCosts");

            migrationBuilder.DropColumn(
                name: "ReasonCodeSnapshot",
                table: "FeAdditionalCosts");

            migrationBuilder.DropColumn(
                name: "ReasonTextSnapshot",
                table: "FeAdditionalCosts");

            migrationBuilder.RenameColumn(
                name: "ReasonTextSnapshot",
                table: "StdAdditionalCosts",
                newName: "ReasonNameSnapshot");

            migrationBuilder.AddColumn<string>(
                name: "ReasonText",
                table: "FeAdditionalCosts",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "FeReasons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Reason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeReasons", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FeReasons_Reason",
                table: "FeReasons",
                column: "Reason",
                unique: true);
        }
    }
}
