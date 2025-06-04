#!/usr/bin/env python3
"""
BO 推荐系统测试脚本

用于测试 BO 推荐系统的各个组件：
- 数据库连接和表创建
- 推荐点插入和查询
- 参数映射功能
- 实验任务创建
- 监听器功能
"""

import asyncio
import json
import uuid
import sys
from datetime import datetime
from pathlib import Path

try:
    from recommendationListener import BORecommendation, RecommendationListener
    from boToUoMapper import BOToUOMapper
    from createExperimentTask import ExperimentTaskCreator
except ImportError as e:
    print(f"Import error: {e}")
    print("Please make sure you're running from the correct directory")
    sys.exit(1)


async def test_database_setup():
    """测试数据库设置"""
    print("🔧 测试数据库设置...")

    try:
        # 创建监听器实例（会自动创建数据库表）
        listener = RecommendationListener(db_path="test_bo.duckdb")
        print("✅ 数据库表创建成功")

        # 测试数据库连接
        import duckdb
        conn = duckdb.connect("test_bo.duckdb")

        # 检查表是否存在
        tables = conn.execute("SHOW TABLES").fetchall()
        print(f"📊 数据库表: {[table[0] for table in tables]}")

        conn.close()
        return True

    except Exception as e:
        print(f"❌ 数据库设置失败: {e}")
        return False


async def test_recommendation_insertion():
    """测试推荐点插入"""
    print("\n📝 测试推荐点插入...")

    try:
        import duckdb
        conn = duckdb.connect("test_bo.duckdb")

        # 插入测试推荐
        test_recommendations = [
            {
                "id": str(uuid.uuid4()),
                "round": 1,
                "flow_rate": 5.5,
                "powder_type": "catalyst_A",
                "volume": 25.0,
                "temperature": 50.0,
                "pressure": 1.2
            },
            {
                "id": str(uuid.uuid4()),
                "round": 2,
                "flow_rate": 7.2,
                "powder_type": "catalyst_B",
                "volume": 30.0,
                "temperature": 60.0,
                "pressure": 1.5
            }
        ]

        for rec in test_recommendations:
            conn.execute("""
                INSERT INTO recommendations (
                    id, round, flow_rate, powder_type, volume,
                    temperature, pressure, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
            """, [
                rec["id"], rec["round"], rec["flow_rate"],
                rec["powder_type"], rec["volume"],
                rec["temperature"], rec["pressure"]
            ])

        # 查询插入的数据
        result = conn.execute("SELECT COUNT(*) FROM recommendations").fetchone()
        print(f"✅ 成功插入 {len(test_recommendations)} 个推荐点，数据库中共有 {result[0]} 条记录")

        conn.close()
        return test_recommendations

    except Exception as e:
        print(f"❌ 推荐点插入失败: {e}")
        return []


async def test_parameter_mapping():
    """测试参数映射"""
    print("\n🔄 测试参数映射...")

    try:
        # 创建测试推荐
        test_recommendation = BORecommendation(
            id="test_mapping_001",
            round=1,
            flow_rate=5.5,
            powder_type="catalyst_A",
            volume=25.0,
            temperature=50.0,
            pressure=1.2,
            created_at=datetime.now()
        )

        # 创建映射器
        mapper = BOToUOMapper()

        # 执行映射
        uo_config = mapper.map_bo_to_uo(test_recommendation)

        print("✅ 参数映射成功")
        print("📋 映射结果:")
        print(json.dumps(uo_config, indent=2, ensure_ascii=False))

        # 验证映射结果
        assert "unit_operation" in uo_config
        assert "parameters" in uo_config
        assert "metadata" in uo_config
        assert uo_config["metadata"]["bo_recommendation_id"] == test_recommendation.id

        print("✅ 映射结果验证通过")
        return uo_config

    except Exception as e:
        print(f"❌ 参数映射失败: {e}")
        return None


async def test_experiment_creation():
    """测试实验任务创建"""
    print("\n🧪 测试实验任务创建...")

    try:
        # 创建测试推荐和 UO 配置
        test_recommendation = BORecommendation(
            id="test_experiment_001",
            round=1,
            flow_rate=5.5,
            powder_type="catalyst_A",
            volume=25.0,
            temperature=50.0,
            created_at=datetime.now()
        )

        test_uo_config = {
            "unit_operation": "dispense_powder",
            "category": "material_handling",
            "description": "Test dispense powder operation",
            "parameters": {
                "flow_rate": 5.5,
                "material_type": "catalyst_A",
                "target_volume": 25.0,
                "temperature": 50.0
            },
            "metadata": {
                "source": "BO_recommendation",
                "bo_round": 1,
                "bo_recommendation_id": "test_experiment_001"
            }
        }

        # 创建任务创建器
        task_creator = ExperimentTaskCreator()

        # 创建实验任务
        experiment_id = await task_creator.create_experiment_task(
            test_recommendation,
            test_uo_config,
            "Test-BO-Experiment"
        )

        print(f"✅ 实验任务创建成功，ID: {experiment_id}")

        # 获取实验状态
        status = task_creator.get_experiment_status(experiment_id)
        if status:
            print("📊 实验状态:")
            print(json.dumps(status, indent=2, ensure_ascii=False))

        return experiment_id

    except Exception as e:
        print(f"❌ 实验任务创建失败: {e}")
        return None


async def test_listener_functionality():
    """测试监听器功能"""
    print("\n👂 测试监听器功能...")

    try:
        # 创建监听器
        listener = RecommendationListener(
            db_path="test_bo.duckdb",
            polling_interval=5,  # 5秒轮询间隔用于测试
            auto_start=False
        )

        # 获取状态
        status = listener.get_status()
        print("📊 监听器状态:")
        print(json.dumps(status, indent=2, ensure_ascii=False))

        # 手动触发一次处理
        print("\n🔄 执行手动触发...")
        result = await listener.manual_trigger()
        print("📋 手动触发结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))

        # 测试短时间监听
        print("\n⏰ 启动短时间监听测试（10秒）...")

        # 启动监听器
        listener_task = asyncio.create_task(listener.start_listening())

        # 等待10秒
        await asyncio.sleep(10)

        # 停止监听器
        await listener.stop_listening()

        # 等待监听器任务完成
        try:
            await asyncio.wait_for(listener_task, timeout=5)
        except asyncio.TimeoutError:
            listener_task.cancel()

        print("✅ 监听器功能测试完成")
        return True

    except Exception as e:
        print(f"❌ 监听器功能测试失败: {e}")
        return False


async def test_end_to_end_workflow():
    """端到端工作流测试"""
    print("\n🔄 端到端工作流测试...")

    try:
        # 1. 创建新的推荐点
        import duckdb
        conn = duckdb.connect("test_bo.duckdb")

        recommendation_id = str(uuid.uuid4())
        conn.execute("""
            INSERT INTO recommendations (
                id, round, flow_rate, powder_type, volume,
                temperature, pressure, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
        """, [recommendation_id, 3, 8.0, "catalyst_C", 35.0, 70.0, 1.8])

        conn.close()
        print(f"✅ 创建新推荐点: {recommendation_id}")

        # 2. 创建监听器并处理
        listener = RecommendationListener(db_path="test_bo.duckdb")

        # 手动触发处理
        result = await listener.manual_trigger()

        if result["success"]:
            print("✅ 推荐点处理成功")

            # 3. 检查推荐点状态
            conn = duckdb.connect("test_bo.duckdb")
            rec_result = conn.execute(
                "SELECT status, processed_at FROM recommendations WHERE id = ?",
                [recommendation_id]
            ).fetchone()
            conn.close()

            if rec_result:
                status, processed_at = rec_result
                print(f"📊 推荐点状态: {status}, 处理时间: {processed_at}")

            # 4. 检查生成的实验
            task_creator = ExperimentTaskCreator()
            experiments = task_creator.list_active_experiments()

            print(f"🧪 当前活跃实验数量: {len(experiments)}")
            for exp in experiments[-3:]:  # 显示最近3个实验
                print(f"   - {exp['experiment_name']}: {exp['status']}")

            print("✅ 端到端工作流测试成功")
            return True
        else:
            print(f"❌ 推荐点处理失败: {result.get('error')}")
            return False

    except Exception as e:
        print(f"❌ 端到端工作流测试失败: {e}")
        return False


async def cleanup_test_data():
    """清理测试数据"""
    print("\n🧹 清理测试数据...")

    try:
        test_db_path = Path("test_bo.duckdb")
        if test_db_path.exists():
            test_db_path.unlink()
            print("✅ 测试数据库文件已删除")
        else:
            print("ℹ️ 测试数据库文件不存在")

    except Exception as e:
        print(f"⚠️ 清理测试数据时出错: {e}")


async def main():
    """主测试函数"""
    print("🚀 开始 BO 推荐系统测试")
    print("=" * 50)

    test_results = []

    # 运行各项测试
    test_results.append(await test_database_setup())
    test_results.append(bool(await test_recommendation_insertion()))
    test_results.append(bool(await test_parameter_mapping()))
    test_results.append(bool(await test_experiment_creation()))
    test_results.append(await test_listener_functionality())
    test_results.append(await test_end_to_end_workflow())

    # 汇总测试结果
    print("\n" + "=" * 50)
    print("📊 测试结果汇总:")

    test_names = [
        "数据库设置",
        "推荐点插入",
        "参数映射",
        "实验任务创建",
        "监听器功能",
        "端到端工作流"
    ]

    passed = 0
    for i, (name, result) in enumerate(zip(test_names, test_results)):
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{i+1}. {name}: {status}")
        if result:
            passed += 1

    print(f"\n总计: {passed}/{len(test_results)} 项测试通过")

    if passed == len(test_results):
        print("🎉 所有测试通过！BO 推荐系统运行正常。")
    else:
        print("⚠️ 部分测试失败，请检查相关组件。")

    # 询问是否清理测试数据
    try:
        cleanup = input("\n是否清理测试数据？(y/N): ").lower().strip()
        if cleanup == 'y':
            await cleanup_test_data()
    except KeyboardInterrupt:
        print("\n测试中断")

    return passed == len(test_results)


if __name__ == "__main__":
    asyncio.run(main())
