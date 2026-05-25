using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class fixedNullIssueForTaskTypeInLimits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RequisitionLimitRules_FeTaskTypes_FeTaskTypeId",
                table: "RequisitionLimitRules");

            migrationBuilder.DropIndex(
                name: "IX_RequisitionLimitRules_Category_FeTaskTypeId_Fascia",
                table: "RequisitionLimitRules");

            migrationBuilder.AlterColumn<Guid>(
                name: "FeTaskTypeId",
                table: "RequisitionLimitRules",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionLimitRules_Category_FeTaskTypeId_Fascia",
                table: "RequisitionLimitRules",
                columns: new[] { "Category", "FeTaskTypeId", "Fascia" },
                unique: true,
                filter: "[FeTaskTypeId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_RequisitionLimitRules_FeTaskTypes_FeTaskTypeId",
                table: "RequisitionLimitRules",
                column: "FeTaskTypeId",
                principalTable: "FeTaskTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RequisitionLimitRules_FeTaskTypes_FeTaskTypeId",
                table: "RequisitionLimitRules");

            migrationBuilder.DropIndex(
                name: "IX_RequisitionLimitRules_Category_FeTaskTypeId_Fascia",
                table: "RequisitionLimitRules");

            migrationBuilder.AlterColumn<Guid>(
                name: "FeTaskTypeId",
                table: "RequisitionLimitRules",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionLimitRules_Category_FeTaskTypeId_Fascia",
                table: "RequisitionLimitRules",
                columns: new[] { "Category", "FeTaskTypeId", "Fascia" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_RequisitionLimitRules_FeTaskTypes_FeTaskTypeId",
                table: "RequisitionLimitRules",
                column: "FeTaskTypeId",
                principalTable: "FeTaskTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
