using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class AdjustedLimitRuleConfigAndEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RequisitionLimitRules_Category",
                table: "RequisitionLimitRules");

            migrationBuilder.DropIndex(
                name: "IX_RequisitionLimitRules_Category_FeTaskTypeId_Fascia",
                table: "RequisitionLimitRules");

            migrationBuilder.DropCheckConstraint(
                name: "CK_RequisitionLimitRules_MaxQuantity_NonNegative",
                table: "RequisitionLimitRules");

            migrationBuilder.DropCheckConstraint(
                name: "CK_RequisitionLimitRules_MaxRate_NonNegative",
                table: "RequisitionLimitRules");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "RequisitionLimitRules");

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxRate",
                table: "RequisitionLimitRules",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldPrecision: 18,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MaxQuantity",
                table: "RequisitionLimitRules",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "FeTaskTypeId",
                table: "RequisitionLimitRules",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Fascia",
                table: "RequisitionLimitRules",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionLimitRules_Category_FeTaskTypeId_Fascia",
                table: "RequisitionLimitRules",
                columns: new[] { "Category", "FeTaskTypeId", "Fascia" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_RequisitionLimitRules_MaxQuantity_Positive",
                table: "RequisitionLimitRules",
                sql: "[MaxQuantity] > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_RequisitionLimitRules_MaxRate_Positive",
                table: "RequisitionLimitRules",
                sql: "[MaxRate] > 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RequisitionLimitRules_Category_FeTaskTypeId_Fascia",
                table: "RequisitionLimitRules");

            migrationBuilder.DropCheckConstraint(
                name: "CK_RequisitionLimitRules_MaxQuantity_Positive",
                table: "RequisitionLimitRules");

            migrationBuilder.DropCheckConstraint(
                name: "CK_RequisitionLimitRules_MaxRate_Positive",
                table: "RequisitionLimitRules");

            migrationBuilder.AlterColumn<decimal>(
                name: "MaxRate",
                table: "RequisitionLimitRules",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<int>(
                name: "MaxQuantity",
                table: "RequisitionLimitRules",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<Guid>(
                name: "FeTaskTypeId",
                table: "RequisitionLimitRules",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<int>(
                name: "Fascia",
                table: "RequisitionLimitRules",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "RequisitionLimitRules",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionLimitRules_Category",
                table: "RequisitionLimitRules",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionLimitRules_Category_FeTaskTypeId_Fascia",
                table: "RequisitionLimitRules",
                columns: new[] { "Category", "FeTaskTypeId", "Fascia" });

            migrationBuilder.AddCheckConstraint(
                name: "CK_RequisitionLimitRules_MaxQuantity_NonNegative",
                table: "RequisitionLimitRules",
                sql: "[MaxQuantity] IS NULL OR [MaxQuantity] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_RequisitionLimitRules_MaxRate_NonNegative",
                table: "RequisitionLimitRules",
                sql: "[MaxRate] IS NULL OR [MaxRate] >= 0");
        }
    }
}
