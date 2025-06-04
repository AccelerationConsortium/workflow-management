"""
BO 到 UO 参数映射模块

功能：
- 将 BO 推荐点字段映射为 Canvas 所需的 UO JSON 配置
- 支持参数名映射、单位转换、默认值设置
- 支持映射配置文件（JSON schema）
"""

import json
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass
class ParameterMapping:
    """参数映射配置"""
    bo_field: str           # BO 推荐中的字段名
    uo_parameter: str       # UO 中的参数名
    unit_conversion: Optional[float] = None  # 单位转换系数
    default_value: Optional[Any] = None      # 默认值
    validation_range: Optional[tuple] = None # 验证范围 (min, max)
    required: bool = True   # 是否必需


@dataclass
class UOTemplate:
    """UO 模板配置"""
    unit_operation: str
    category: str
    description: str
    parameters: Dict[str, Any]
    constraints: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class BOToUOMapper:
    """BO 到 UO 映射器"""
    
    def __init__(self, config_path: Optional[str] = None):
        """
        初始化映射器
        
        Args:
            config_path: 映射配置文件路径，如果为 None 则使用默认配置
        """
        self.config_path = config_path
        self.mapping_config = self._load_mapping_config()
        
    def _load_mapping_config(self) -> Dict[str, Any]:
        """加载映射配置"""
        if self.config_path and Path(self.config_path).exists():
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                logger.info(f"Loaded mapping config from {self.config_path}")
                return config
            except Exception as e:
                logger.error(f"Failed to load mapping config from {self.config_path}: {e}")
        
        # 使用默认配置
        return self._get_default_mapping_config()
    
    def _get_default_mapping_config(self) -> Dict[str, Any]:
        """获取默认映射配置"""
        return {
            "dispense_powder": {
                "template": {
                    "unit_operation": "dispense_powder",
                    "category": "material_handling",
                    "description": "Dispense powder material with specified parameters"
                },
                "parameter_mappings": [
                    {
                        "bo_field": "flow_rate",
                        "uo_parameter": "flow_rate",
                        "unit_conversion": 1.0,
                        "validation_range": [0.1, 100.0],
                        "required": True
                    },
                    {
                        "bo_field": "powder_type",
                        "uo_parameter": "material_type",
                        "required": True
                    },
                    {
                        "bo_field": "volume",
                        "uo_parameter": "target_volume",
                        "unit_conversion": 1.0,
                        "validation_range": [1.0, 1000.0],
                        "default_value": 10.0,
                        "required": True
                    },
                    {
                        "bo_field": "temperature",
                        "uo_parameter": "temperature",
                        "unit_conversion": 1.0,
                        "validation_range": [20.0, 200.0],
                        "default_value": 25.0,
                        "required": False
                    },
                    {
                        "bo_field": "pressure",
                        "uo_parameter": "pressure",
                        "unit_conversion": 1.0,
                        "validation_range": [0.1, 10.0],
                        "default_value": 1.0,
                        "required": False
                    }
                ]
            },
            "mixing": {
                "template": {
                    "unit_operation": "mixing",
                    "category": "process",
                    "description": "Mix materials with specified parameters"
                },
                "parameter_mappings": [
                    {
                        "bo_field": "flow_rate",
                        "uo_parameter": "mixing_speed",
                        "unit_conversion": 10.0,  # 转换为 RPM
                        "validation_range": [100, 2000],
                        "required": True
                    },
                    {
                        "bo_field": "volume",
                        "uo_parameter": "mixing_volume",
                        "unit_conversion": 1.0,
                        "validation_range": [1.0, 1000.0],
                        "required": True
                    },
                    {
                        "bo_field": "temperature",
                        "uo_parameter": "mixing_temperature",
                        "unit_conversion": 1.0,
                        "validation_range": [20.0, 100.0],
                        "default_value": 25.0,
                        "required": False
                    }
                ]
            }
        }
    
    def map_bo_to_uo(self, recommendation) -> Dict[str, Any]:
        """
        将 BO 推荐点映射为 UO 配置
        
        Args:
            recommendation: BORecommendation 对象
            
        Returns:
            UO JSON 配置字典
        """
        # 确定使用哪个 UO 类型（这里可以根据业务逻辑决定）
        uo_type = self._determine_uo_type(recommendation)
        
        if uo_type not in self.mapping_config:
            raise ValueError(f"Unsupported UO type: {uo_type}")
        
        config = self.mapping_config[uo_type]
        template = config["template"]
        mappings = config["parameter_mappings"]
        
        # 创建基础 UO 配置
        uo_config = {
            "unit_operation": template["unit_operation"],
            "category": template["category"],
            "description": template["description"],
            "parameters": {},
            "metadata": {
                "source": "BO_recommendation",
                "bo_round": recommendation.round,
                "bo_recommendation_id": recommendation.id,
                "created_at": recommendation.created_at.isoformat() if recommendation.created_at else None
            }
        }
        
        # 映射参数
        for mapping in mappings:
            param_mapping = ParameterMapping(**mapping)
            self._map_parameter(recommendation, param_mapping, uo_config["parameters"])
        
        # 验证配置
        self._validate_uo_config(uo_config)
        
        logger.info(f"Mapped BO recommendation {recommendation.id} to UO config: {uo_type}")
        return uo_config
    
    def _determine_uo_type(self, recommendation) -> str:
        """
        根据推荐点确定 UO 类型
        
        这里可以根据业务逻辑实现更复杂的决策
        """
        # 简单示例：根据 powder_type 决定
        if hasattr(recommendation, 'powder_type') and recommendation.powder_type:
            return "dispense_powder"
        else:
            return "mixing"
    
    def _map_parameter(self, recommendation, mapping: ParameterMapping, parameters: Dict[str, Any]):
        """映射单个参数"""
        try:
            # 获取 BO 推荐中的值
            bo_value = getattr(recommendation, mapping.bo_field, None)
            
            # 如果值不存在且有默认值，使用默认值
            if bo_value is None:
                if mapping.default_value is not None:
                    bo_value = mapping.default_value
                elif mapping.required:
                    raise ValueError(f"Required field {mapping.bo_field} is missing")
                else:
                    return  # 可选字段且无默认值，跳过
            
            # 单位转换
            if mapping.unit_conversion and isinstance(bo_value, (int, float)):
                converted_value = bo_value * mapping.unit_conversion
            else:
                converted_value = bo_value
            
            # 验证范围
            if mapping.validation_range and isinstance(converted_value, (int, float)):
                min_val, max_val = mapping.validation_range
                if not (min_val <= converted_value <= max_val):
                    logger.warning(
                        f"Parameter {mapping.uo_parameter} value {converted_value} "
                        f"is outside valid range [{min_val}, {max_val}], clamping"
                    )
                    converted_value = max(min_val, min(max_val, converted_value))
            
            # 设置参数
            parameters[mapping.uo_parameter] = converted_value
            
            logger.debug(f"Mapped {mapping.bo_field}={bo_value} -> {mapping.uo_parameter}={converted_value}")
            
        except Exception as e:
            logger.error(f"Failed to map parameter {mapping.bo_field}: {e}")
            if mapping.required:
                raise
    
    def _validate_uo_config(self, uo_config: Dict[str, Any]):
        """验证 UO 配置的完整性"""
        required_fields = ["unit_operation", "category", "parameters"]
        
        for field in required_fields:
            if field not in uo_config:
                raise ValueError(f"Missing required field: {field}")
        
        if not uo_config["parameters"]:
            raise ValueError("UO configuration must have at least one parameter")
        
        logger.debug("UO configuration validation passed")
    
    def add_custom_mapping(self, uo_type: str, template: Dict[str, Any], mappings: List[Dict[str, Any]]):
        """添加自定义映射配置"""
        self.mapping_config[uo_type] = {
            "template": template,
            "parameter_mappings": mappings
        }
        logger.info(f"Added custom mapping for UO type: {uo_type}")
    
    def save_mapping_config(self, output_path: str):
        """保存映射配置到文件"""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(self.mapping_config, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved mapping config to {output_path}")
        except Exception as e:
            logger.error(f"Failed to save mapping config: {e}")
            raise
    
    def get_supported_uo_types(self) -> List[str]:
        """获取支持的 UO 类型列表"""
        return list(self.mapping_config.keys())
    
    def get_mapping_info(self, uo_type: str) -> Optional[Dict[str, Any]]:
        """获取指定 UO 类型的映射信息"""
        return self.mapping_config.get(uo_type)


# 示例用法和测试函数
def create_sample_mapping_config():
    """创建示例映射配置文件"""
    mapper = BOToUOMapper()
    mapper.save_mapping_config("bo_uo_mapping_config.json")
    return mapper


if __name__ == "__main__":
    # 测试代码
    from .recommendationListener import BORecommendation
    from datetime import datetime
    
    # 创建测试推荐
    test_recommendation = BORecommendation(
        id="test_001",
        round=1,
        flow_rate=5.5,
        powder_type="catalyst_A",
        volume=25.0,
        temperature=50.0,
        created_at=datetime.now()
    )
    
    # 测试映射
    mapper = BOToUOMapper()
    uo_config = mapper.map_bo_to_uo(test_recommendation)
    
    print("Mapped UO Configuration:")
    print(json.dumps(uo_config, indent=2, ensure_ascii=False))
