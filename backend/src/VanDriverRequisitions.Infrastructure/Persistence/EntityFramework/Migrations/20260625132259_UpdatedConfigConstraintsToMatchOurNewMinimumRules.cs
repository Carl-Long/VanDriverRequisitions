using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedConfigConstraintsToMatchOurNewMinimumRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_StdTransfers_FlatCharge_NonNegative",
                table: "StdTransfers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdTransfers_Miles_NonNegative",
                table: "StdTransfers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdTransfers_RatePerMile_NonNegative",
                table: "StdTransfers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdPickups_FlatCharge_NonNegative",
                table: "StdPickups");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdPickups_Miles_NonNegative",
                table: "StdPickups");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdPickups_RatePerMile_NonNegative",
                table: "StdPickups");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdCollectionVanPacks_RatePerVanPack_NonNegative",
                table: "StdCollectionVanPacks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdAdditionalCosts_FlatCharge_NonNegative",
                table: "StdAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdAdditionalCosts_Miles_NonNegative",
                table: "StdAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdAdditionalCosts_RatePerMile_NonNegative",
                table: "StdAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeTransfers_RatePerJob_NonNegative",
                table: "FeTransfers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeMileages_RatePerMile_NonNegative",
                table: "FeMileages");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeGeneralTasks_RatePerJob_NonNegative",
                table: "FeGeneralTasks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_Miles_NonNegative",
                table: "FeAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_RatePerJob_NonNegative",
                table: "FeAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_RatePerMile_NonNegative",
                table: "FeAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_TotalNumber_NonNegative",
                table: "FeAdditionalCosts");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdCollectionChargesBanksAndBins_FlatCharge_Minimum",
                table: "StdTransfers",
                sql: "[FlatCharge] IS NULL OR [FlatCharge] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdCollectionChargesBanksAndBins_Miles_Positive",
                table: "StdTransfers",
                sql: "[Miles] IS NULL OR [Miles] >= 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdCollectionChargesBanksAndBins_RatePerMile_Minimum",
                table: "StdTransfers",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdPickups_FlatCharge_Minimum",
                table: "StdPickups",
                sql: "[FlatCharge] IS NULL OR [FlatCharge] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdPickups_Miles_Positive",
                table: "StdPickups",
                sql: "[Miles] IS NULL OR [Miles] >= 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdPickups_RatePerMile_Minimum",
                table: "StdPickups",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdCollectionVanPacks_RatePerVanPack_Minimum",
                table: "StdCollectionVanPacks",
                sql: "[RatePerVanPack] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdAdditionalCosts_FlatCharge_Minimum",
                table: "StdAdditionalCosts",
                sql: "[FlatCharge] IS NULL OR [FlatCharge] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdAdditionalCosts_Miles_Positive",
                table: "StdAdditionalCosts",
                sql: "[Miles] IS NULL OR [Miles] >= 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdAdditionalCosts_RatePerMile_Minimum",
                table: "StdAdditionalCosts",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeTransfers_RatePerJob_Minimum",
                table: "FeTransfers",
                sql: "[RatePerJob] IS NULL OR [RatePerJob] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeMileages_RatePerMile_Minimum",
                table: "FeMileages",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeGeneralTasks_RatePerJob_Minimum",
                table: "FeGeneralTasks",
                sql: "[RatePerJob] IS NULL OR [RatePerJob] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_Miles_Positive",
                table: "FeAdditionalCosts",
                sql: "[Miles] IS NULL OR [Miles] >= 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_RatePerJob_Minimum",
                table: "FeAdditionalCosts",
                sql: "[RatePerJob] IS NULL OR [RatePerJob] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_RatePerMile_Minimum",
                table: "FeAdditionalCosts",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_TotalNumber_Positive",
                table: "FeAdditionalCosts",
                sql: "[TotalNumber] IS NULL OR [TotalNumber] >= 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_StdCollectionChargesBanksAndBins_FlatCharge_Minimum",
                table: "StdTransfers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdCollectionChargesBanksAndBins_Miles_Positive",
                table: "StdTransfers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdCollectionChargesBanksAndBins_RatePerMile_Minimum",
                table: "StdTransfers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdPickups_FlatCharge_Minimum",
                table: "StdPickups");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdPickups_Miles_Positive",
                table: "StdPickups");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdPickups_RatePerMile_Minimum",
                table: "StdPickups");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdCollectionVanPacks_RatePerVanPack_Minimum",
                table: "StdCollectionVanPacks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdAdditionalCosts_FlatCharge_Minimum",
                table: "StdAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdAdditionalCosts_Miles_Positive",
                table: "StdAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StdAdditionalCosts_RatePerMile_Minimum",
                table: "StdAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeTransfers_RatePerJob_Minimum",
                table: "FeTransfers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeMileages_RatePerMile_Minimum",
                table: "FeMileages");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeGeneralTasks_RatePerJob_Minimum",
                table: "FeGeneralTasks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_Miles_Positive",
                table: "FeAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_RatePerJob_Minimum",
                table: "FeAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_RatePerMile_Minimum",
                table: "FeAdditionalCosts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_TotalNumber_Positive",
                table: "FeAdditionalCosts");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdTransfers_FlatCharge_NonNegative",
                table: "StdTransfers",
                sql: "[FlatCharge] IS NULL OR [FlatCharge] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdTransfers_Miles_NonNegative",
                table: "StdTransfers",
                sql: "[Miles] IS NULL OR [Miles] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdTransfers_RatePerMile_NonNegative",
                table: "StdTransfers",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdPickups_FlatCharge_NonNegative",
                table: "StdPickups",
                sql: "[FlatCharge] IS NULL OR [FlatCharge] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdPickups_Miles_NonNegative",
                table: "StdPickups",
                sql: "[Miles] IS NULL OR [Miles] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdPickups_RatePerMile_NonNegative",
                table: "StdPickups",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdCollectionVanPacks_RatePerVanPack_NonNegative",
                table: "StdCollectionVanPacks",
                sql: "[RatePerVanPack] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdAdditionalCosts_FlatCharge_NonNegative",
                table: "StdAdditionalCosts",
                sql: "[FlatCharge] IS NULL OR [FlatCharge] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdAdditionalCosts_Miles_NonNegative",
                table: "StdAdditionalCosts",
                sql: "[Miles] IS NULL OR [Miles] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StdAdditionalCosts_RatePerMile_NonNegative",
                table: "StdAdditionalCosts",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeTransfers_RatePerJob_NonNegative",
                table: "FeTransfers",
                sql: "[RatePerJob] IS NULL OR [RatePerJob] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeMileages_RatePerMile_NonNegative",
                table: "FeMileages",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeGeneralTasks_RatePerJob_NonNegative",
                table: "FeGeneralTasks",
                sql: "[RatePerJob] IS NULL OR [RatePerJob] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_Miles_NonNegative",
                table: "FeAdditionalCosts",
                sql: "[Miles] IS NULL OR [Miles] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_RatePerJob_NonNegative",
                table: "FeAdditionalCosts",
                sql: "[RatePerJob] IS NULL OR [RatePerJob] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_RatePerMile_NonNegative",
                table: "FeAdditionalCosts",
                sql: "[RatePerMile] IS NULL OR [RatePerMile] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_TotalNumber_NonNegative",
                table: "FeAdditionalCosts",
                sql: "[TotalNumber] IS NULL OR [TotalNumber] >= 0");
        }
    }
}
